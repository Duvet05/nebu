import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Public } from '../../auth/decorators/public.decorator';
import { ResendEmailService } from '../services/resend-email.service';

class SendNewsletterWelcomeDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;
}

class SendPreOrderConfirmationDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser texto' })
  lastName: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  quantity: number;

  @IsNotEmpty({ message: 'El color es requerido' })
  @IsString({ message: 'El color debe ser texto' })
  color: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  totalPrice: number;
}

class SendPreOrderNotificationDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser texto' })
  lastName: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser texto' })
  phone: string;

  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsString({ message: 'La dirección debe ser texto' })
  address: string;

  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @IsString({ message: 'La ciudad debe ser texto' })
  city: string;

  @IsNotEmpty({ message: 'El código postal es requerido' })
  @IsString({ message: 'El código postal debe ser texto' })
  postalCode: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  quantity: number;

  @IsNotEmpty({ message: 'El color es requerido' })
  @IsString({ message: 'El color debe ser texto' })
  color: string;

  @IsNotEmpty({ message: 'El precio es requerido' })
  totalPrice: number;

  @IsNotEmpty({ message: 'El método de pago es requerido' })
  @IsString({ message: 'El método de pago debe ser texto' })
  paymentMethod: string;
}

class OrderItemDto {
  @IsNotEmpty({ message: 'El nombre del producto es requerido' })
  @IsString({ message: 'El nombre del producto debe ser texto' })
  productName: string;

  @IsNotEmpty({ message: 'El nombre del color es requerido' })
  @IsString({ message: 'El nombre del color debe ser texto' })
  colorName: string;

  @IsNotEmpty({ message: 'La cantidad es requerida' })
  @IsNumber({}, { message: 'La cantidad debe ser un número' })
  quantity: number;

  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  price: number;
}

class SendOrderConfirmationDto {
  @IsNotEmpty({ message: 'El email es requerido' })
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email: string;

  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser texto' })
  firstName: string;

  @IsNotEmpty({ message: 'El apellido es requerido' })
  @IsString({ message: 'El apellido debe ser texto' })
  lastName: string;

  @IsNotEmpty({ message: 'El ID de orden es requerido' })
  @IsString({ message: 'El ID de orden debe ser texto' })
  orderId: string;

  @IsNotEmpty({ message: 'Los items son requeridos' })
  @IsArray({ message: 'Los items deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNotEmpty({ message: 'El subtotal es requerido' })
  @IsNumber({}, { message: 'El subtotal debe ser un número' })
  subtotal: number;

  @IsNotEmpty({ message: 'El costo de envío es requerido' })
  @IsNumber({}, { message: 'El costo de envío debe ser un número' })
  shipping: number;

  @IsNotEmpty({ message: 'El total es requerido' })
  @IsNumber({}, { message: 'El total debe ser un número' })
  total: number;

  @IsNotEmpty({ message: 'El monto de reserva es requerido' })
  @IsNumber({}, { message: 'El monto de reserva debe ser un número' })
  reserveAmount: number;

  @IsNotEmpty({ message: 'La dirección es requerida' })
  @IsString({ message: 'La dirección debe ser texto' })
  address: string;

  @IsNotEmpty({ message: 'La ciudad es requerida' })
  @IsString({ message: 'La ciudad debe ser texto' })
  city: string;

  @IsNotEmpty({ message: 'El código postal es requerido' })
  @IsString({ message: 'El código postal debe ser texto' })
  postalCode: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser texto' })
  phone: string;
}

@ApiTags('Email Public')
@Controller('email/public')
export class EmailPublicController {
  private readonly logger = new Logger(EmailPublicController.name);

  constructor(
    private readonly resendEmailService: ResendEmailService,
  ) {}

  @Public()
  @Post('newsletter-welcome')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar email de bienvenida al newsletter' })
  @ApiResponse({ status: 200, description: 'Email enviado exitosamente' })
  async sendNewsletterWelcome(
    @Body() data: SendNewsletterWelcomeDto,
  ) {
    try {
      this.logger.log(`Sending newsletter welcome email to ${data.email}`);

      const result = await this.resendEmailService.sendWelcomeEmail(
        data.email,
        data.email, // Use email as name if not provided
      );

      return {
        success: true,
        message: 'Email de bienvenida enviado',
        emailId: result.id,
      };
    } catch (error) {
      this.logger.error(`Failed to send newsletter welcome email: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Post('pre-order-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar confirmación de pre-orden al cliente' })
  @ApiResponse({ status: 200, description: 'Email enviado exitosamente' })
  async sendPreOrderConfirmation(
    @Body() data: SendPreOrderConfirmationDto,
  ) {
    try {
      this.logger.log(`Sending pre-order confirmation to ${data.email}`);

      // For now, use the generic notification email until we create specific templates
      const result = await this.resendEmailService.sendNotificationEmail({
        to: data.email,
        title: '¡Pre-orden Confirmada!',
        message: `
          <p>Hola <strong>${data.firstName} ${data.lastName}</strong>,</p>
          <p>¡Gracias por tu pre-orden!</p>
          <h3>Detalles de tu pedido:</h3>
          <ul>
            <li><strong>Producto:</strong> Nebu Dino</li>
            <li><strong>Color:</strong> ${data.color}</li>
            <li><strong>Cantidad:</strong> ${data.quantity}</li>
            <li><strong>Total:</strong> S/ ${data.totalPrice.toFixed(2)}</li>
            <li><strong>Reserva (50%):</strong> S/ ${(data.totalPrice * 0.5).toFixed(2)}</li>
          </ul>
          <p>Pronto te enviaremos las instrucciones de pago.</p>
          <p>¡Gracias por confiar en Nebu!</p>
        `,
      });

      return {
        success: true,
        message: 'Email de confirmación enviado',
        emailId: result.id,
      };
    } catch (error) {
      this.logger.error(`Failed to send pre-order confirmation: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Post('pre-order-notification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar notificación de pre-orden al equipo' })
  @ApiResponse({ status: 200, description: 'Email enviado exitosamente' })
  async sendPreOrderNotification(
    @Body() data: SendPreOrderNotificationDto,
  ) {
    try {
      this.logger.log(`Sending pre-order notification for ${data.email}`);

      const adminEmail = process.env.RESEND_FROM_EMAIL || 'admin@flow-telligence.com';

      const result = await this.resendEmailService.sendNotificationEmail({
        to: adminEmail,
        title: `Nueva Pre-orden: ${data.firstName} ${data.lastName}`,
        message: `
          <h2>Detalles del Cliente</h2>
          <ul>
            <li><strong>Nombre:</strong> ${data.firstName} ${data.lastName}</li>
            <li><strong>Email:</strong> ${data.email}</li>
            <li><strong>Teléfono:</strong> ${data.phone}</li>
            <li><strong>Dirección:</strong> ${data.address}, ${data.city}, ${data.postalCode}</li>
          </ul>
          <h2>Detalles del Pedido</h2>
          <ul>
            <li><strong>Color:</strong> ${data.color}</li>
            <li><strong>Cantidad:</strong> ${data.quantity}</li>
            <li><strong>Método de pago:</strong> ${data.paymentMethod}</li>
            <li><strong>Total:</strong> S/ ${data.totalPrice.toFixed(2)}</li>
            <li><strong>Reserva (50%):</strong> S/ ${(data.totalPrice * 0.5).toFixed(2)}</li>
          </ul>
          <p><strong>Acciones requeridas:</strong></p>
          <ol>
            <li>Contactar al cliente en las próximas 24 horas</li>
            <li>Enviar instrucciones de pago</li>
            <li>Confirmar pago de la reserva</li>
          </ol>
        `,
      });

      return {
        success: true,
        message: 'Notificación enviada al equipo',
        emailId: result.id,
      };
    } catch (error) {
      this.logger.error(`Failed to send pre-order notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Public()
  @Post('order-confirmation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enviar confirmación de orden (checkout completo)' })
  @ApiResponse({ status: 200, description: 'Email enviado exitosamente' })
  async sendOrderConfirmation(@Body() data: SendOrderConfirmationDto) {
    try {
      this.logger.log(`Sending order confirmation to ${data.email} for order ${data.orderId}`);

      const itemsList = data.items
        .map(item => `<li>${item.productName} - ${item.colorName} (${item.quantity}x) - S/ ${(item.price * item.quantity).toFixed(2)}</li>`)
        .join('');

      // Email to customer
      const customerResult = await this.resendEmailService.sendNotificationEmail({
        to: data.email,
        title: `Confirmación de Pre-orden - ${data.orderId}`,
        message: `
          <p>Hola <strong>${data.firstName} ${data.lastName}</strong>,</p>
          <p>¡Gracias por tu pre-orden!</p>

          <h3>📦 Detalles de tu Pedido #${data.orderId}</h3>
          <ul>${itemsList}</ul>

          <p><strong>Subtotal:</strong> S/ ${data.subtotal.toFixed(2)}</p>
          <p><strong>Envío:</strong> GRATIS</p>
          <p><strong>Total:</strong> S/ ${data.total.toFixed(2)}</p>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p><strong>💰 Modalidad de Pre-orden (50%)</strong></p>
            <p><strong>A pagar ahora:</strong> S/ ${data.reserveAmount.toFixed(2)}</p>
            <p><strong>Saldo al entregar:</strong> S/ ${(data.total - data.reserveAmount).toFixed(2)}</p>
          </div>

          <h3>📍 Dirección de Envío</h3>
          <p>${data.address}<br>${data.city}, ${data.postalCode}<br>📱 ${data.phone}</p>

          <p>Te enviaremos un enlace de pago para completar la reserva.</p>
          <p>¡Gracias por confiar en Nebu!</p>
        `,
      });

      // Email to admin
      const adminEmail = process.env.RESEND_FROM_EMAIL || 'admin@flow-telligence.com';
      await this.resendEmailService.sendNotificationEmail({
        to: adminEmail,
        title: `Nueva Pre-orden Recibida - ${data.orderId}`,
        message: `
          <h2>🛒 Nueva Pre-orden #${data.orderId}</h2>

          <h3>👤 Cliente</h3>
          <p>${data.firstName} ${data.lastName}<br>${data.email}<br>${data.phone}</p>

          <h3>📦 Productos</h3>
          <ul>${itemsList}</ul>

          <p><strong>Total:</strong> S/ ${data.total.toFixed(2)}</p>
          <p><strong>Reserva (50%):</strong> S/ ${data.reserveAmount.toFixed(2)}</p>

          <h3>📍 Dirección</h3>
          <p>${data.address}, ${data.city}, ${data.postalCode}</p>
        `,
      });

      return {
        success: true,
        message: 'Emails de confirmación enviados',
        emailId: customerResult.id,
      };
    } catch (error) {
      this.logger.error(`Failed to send order confirmation: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
