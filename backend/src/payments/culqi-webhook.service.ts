import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { PaymentTransaction, PaymentStatus, PaymentMethod } from '../orders/entities/payment-transaction.entity';
import { CulqiService } from './services/culqi.service';
import { EmailService } from '../email/services/email.service';

/**
 * Servicio para procesar webhooks de Culqi
 *
 * Eventos soportados:
 * - event.charge.succeeded - Pago exitoso
 * - event.charge.failed - Pago fallido
 * - event.order.expired - Orden expirada
 * - event.refund.succeeded - Reembolso exitoso
 */
@Injectable()
export class CulqiWebhookService {
  private readonly logger = new Logger(CulqiWebhookService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentRepository: Repository<PaymentTransaction>,
    private readonly culqiService: CulqiService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Procesa un evento de webhook de Culqi
   */
  async processWebhookEvent(event: any): Promise<void> {
    const processedEvent = this.culqiService.processWebhook(event);
    const { type, data } = processedEvent;

    this.logger.log(`Processing webhook event: ${type}`, data);

    switch (type) {
      case 'charge_succeeded':
        await this.handleChargeSucceeded(data);
        break;

      case 'charge_failed':
        await this.handleChargeFailed(data);
        break;

      case 'order_expired':
        await this.handleOrderExpired(data);
        break;

      case 'refund_succeeded':
        await this.handleRefundSucceeded(data);
        break;

      default:
        this.logger.warn(`Unknown webhook event type: ${type}`);
        break;
    }
  }

  /**
   * Maneja un pago exitoso
   */
  private async handleChargeSucceeded(data: {
    chargeId: string;
    amount: number;
    currency: string;
    email: string;
    metadata: Record<string, any>;
    createdAt: number;
  }): Promise<void> {
    this.logger.log(`Charge succeeded: ${data.chargeId}`);

    try {
      // Buscar orden usando metadata
      const orderNumber = data.metadata?.order_number;
      if (!orderNumber) {
        this.logger.warn('No order_number found in metadata');
        return;
      }

      const order = await this.orderRepository.findOne({
        where: { orderNumber },
        relations: ['payments', 'items'],
      });

      if (!order) {
        this.logger.error(`Order not found: ${orderNumber}`);
        return;
      }

      // Crear o actualizar transacción de pago
      let payment = await this.paymentRepository.findOne({
        where: {
          orderId: order.id,
          transactionId: data.chargeId,
        },
      });

      if (!payment) {
        payment = this.paymentRepository.create({
          orderId: order.id,
          amount: data.amount,
          paymentMethod: PaymentMethod.CULQI,
          status: PaymentStatus.COMPLETED,
          transactionId: data.chargeId,
          processedAt: new Date(data.createdAt * 1000),
          metadata: {
            culqi_charge_id: data.chargeId,
            currency: data.currency,
            email: data.email,
            raw_metadata: data.metadata,
          },
        });
      } else {
        payment.status = PaymentStatus.COMPLETED;
        payment.processedAt = new Date(data.createdAt * 1000);
      }

      await this.paymentRepository.save(payment);

      // Actualizar estado de la orden
      await this.updateOrderStatus(order);

      // Enviar email de confirmación
      await this.sendPaymentConfirmationEmail(order, payment);

      this.logger.log(`Payment processed successfully for order ${orderNumber}`);
    } catch (error) {
      this.logger.error('Error handling charge succeeded:', error);
      throw error;
    }
  }

  /**
   * Maneja un pago fallido
   */
  private async handleChargeFailed(data: {
    chargeId: string;
    email: string;
    reason: string;
    errorCode: string;
  }): Promise<void> {
    this.logger.log(`Charge failed: ${data.chargeId} - ${data.reason}`);

    try {
      // Buscar transacción por chargeId
      const payment = await this.paymentRepository.findOne({
        where: { transactionId: data.chargeId },
        relations: ['order'],
      });

      if (payment) {
        payment.status = PaymentStatus.FAILED;
        payment.errorMessage = data.reason;
        payment.metadata = {
          ...payment.metadata,
          error_code: data.errorCode,
          failed_at: new Date().toISOString(),
        };

        await this.paymentRepository.save(payment);

        // Enviar notificación de fallo
        await this.sendPaymentFailureEmail(payment.order, data.reason);

        this.logger.log(`Payment marked as failed: ${data.chargeId}`);
      }
    } catch (error) {
      this.logger.error('Error handling charge failed:', error);
      throw error;
    }
  }

  /**
   * Maneja una orden expirada
   */
  private async handleOrderExpired(data: {
    orderId: string;
    orderNumber: string;
  }): Promise<void> {
    this.logger.log(`Order expired: ${data.orderNumber}`);

    try {
      const order = await this.orderRepository.findOne({
        where: { orderNumber: data.orderNumber },
      });

      if (order && order.status === OrderStatus.PENDING) {
        order.status = OrderStatus.CANCELLED;
        order.notes = `Orden cancelada automáticamente por expiración (Culqi Order ID: ${data.orderId})`;

        await this.orderRepository.save(order);

        this.logger.log(`Order ${data.orderNumber} marked as cancelled`);
      }
    } catch (error) {
      this.logger.error('Error handling order expired:', error);
      throw error;
    }
  }

  /**
   * Maneja un reembolso exitoso
   */
  private async handleRefundSucceeded(data: {
    refundId: string;
    chargeId: string;
    amount: number;
    reason: string;
  }): Promise<void> {
    this.logger.log(`Refund succeeded: ${data.refundId}`);

    try {
      const payment = await this.paymentRepository.findOne({
        where: { transactionId: data.chargeId },
        relations: ['order'],
      });

      if (payment) {
        const previousRefundedAmount = Number(payment.refundedAmount || 0);
        const newRefundedAmount = previousRefundedAmount + data.amount;
        const totalAmount = Number(payment.amount);

        payment.refundedAmount = newRefundedAmount;
        payment.refundedAt = new Date();
        payment.refundReason = data.reason;

        // Actualizar estado según monto reembolsado
        if (newRefundedAmount >= totalAmount) {
          payment.status = PaymentStatus.REFUNDED;
        } else {
          payment.status = PaymentStatus.PARTIALLY_REFUNDED;
        }

        payment.metadata = {
          ...payment.metadata,
          refund_id: data.refundId,
          refund_reason: data.reason,
          refunded_at: new Date().toISOString(),
        };

        await this.paymentRepository.save(payment);

        // Enviar email de reembolso
        await this.sendRefundConfirmationEmail(payment.order, data.amount);

        this.logger.log(`Refund processed for payment ${payment.id}`);
      }
    } catch (error) {
      this.logger.error('Error handling refund succeeded:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de una orden basado en los pagos
   */
  private async updateOrderStatus(order: Order): Promise<void> {
    const paidAmount = order.paidAmount;
    const totalAmount = Number(order.totalAmount);
    const reserveAmount = Number(order.reserveAmount || totalAmount * 0.5);

    let newStatus = order.status;

    if (paidAmount >= totalAmount) {
      // Pago completo
      newStatus = OrderStatus.CONFIRMED;
    } else if (paidAmount >= reserveAmount) {
      // Pago de reserva (50%)
      newStatus = OrderStatus.RESERVED;
    }

    if (newStatus !== order.status) {
      this.logger.log(`Updating order ${order.orderNumber} status: ${order.status} → ${newStatus}`);
      order.status = newStatus;
      await this.orderRepository.save(order);
    }
  }

  /**
   * Envía email de confirmación de pago
   */
  private async sendPaymentConfirmationEmail(order: Order, payment: PaymentTransaction): Promise<void> {
    try {
      await this.emailService.sendPaymentConfirmationEmail(
        order.contactEmail,
        Number(payment.amount),
        order.orderNumber,
      );

      // Marcar email como enviado
      if (!order.emailSent) {
        order.emailSent = true;
        await this.orderRepository.save(order);
      }
    } catch (error) {
      this.logger.error('Error sending payment confirmation email:', error);
      // No lanzar error, solo logear
    }
  }

  /**
   * Envía email de fallo de pago
   */
  private async sendPaymentFailureEmail(order: Order, reason: string): Promise<void> {
    try {
      await this.emailService.sendNotificationEmail({
        to: order.contactEmail,
        title: 'Pago no procesado',
        message: `
          <p>Hola,</p>
          <p>Lamentamos informarte que el pago para tu orden <strong>#${order.orderNumber}</strong> no pudo ser procesado.</p>
          <p><strong>Razón:</strong> ${reason}</p>
          <p>Por favor, intenta nuevamente o contacta a nuestro equipo de soporte.</p>
        `,
      });
    } catch (error) {
      this.logger.error('Error sending payment failure email:', error);
    }
  }

  /**
   * Envía email de confirmación de reembolso
   */
  private async sendRefundConfirmationEmail(order: Order, amount: number): Promise<void> {
    try {
      await this.emailService.sendNotificationEmail({
        to: order.contactEmail,
        title: 'Reembolso procesado',
        message: `
          <p>Hola,</p>
          <p>Te confirmamos que se ha procesado un reembolso de <strong>S/ ${amount.toFixed(2)}</strong> para tu orden <strong>#${order.orderNumber}</strong>.</p>
          <p>El dinero será devuelto a tu método de pago original en 5-10 días hábiles.</p>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        `,
      });
    } catch (error) {
      this.logger.error('Error sending refund confirmation email:', error);
    }
  }
}
