import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole, User } from '../../users/entities/user.entity';
import { Notification } from '../entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una notificación' })
  @ApiResponse({ status: 201, description: 'Notificación creada exitosamente', type: Notification })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(createNotificationDto);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Enviar notificaciones masivas' })
  @ApiResponse({
    status: 201,
    description: 'Notificaciones enviadas exitosamente',
    type: [Notification],
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  sendBulk(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.sendBulk(sendNotificationDto);
  }

  @Post('template/:templateName')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Enviar notificaciones desde plantilla' })
  @ApiParam({ name: 'templateName', description: 'Nombre de la plantilla' })
  @ApiResponse({
    status: 201,
    description: 'Notificaciones enviadas exitosamente',
    type: [Notification],
  })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
  sendFromTemplate(
    @Param('templateName') templateName: string,
    @Body('userIds') userIds: string[],
    @Body('variables') variables: Record<string, any> = {}
  ) {
    return this.notificationsService.sendFromTemplate(templateName, userIds, variables);
  }

  @Get('my')
  @ApiOperation({ summary: 'Obtener mis notificaciones' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de notificaciones por página',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Número de notificaciones a omitir',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones obtenidas exitosamente',
    type: [Notification],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getMyNotifications(
    @CurrentUser() user: any,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    return this.notificationsService.findByUser(user.id, limit, offset);
  }

  @Get('my/unread')
  @ApiOperation({ summary: 'Obtener mis notificaciones no leídas' })
  @ApiResponse({
    status: 200,
    description: 'Notificaciones no leídas obtenidas exitosamente',
    type: [Notification],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getMyUnreadNotifications(@CurrentUser() user: any) {
    return this.notificationsService.findUnreadByUser(user.id);
  }

  @Get('my/stats')
  @ApiOperation({ summary: 'Obtener estadísticas de mis notificaciones' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total de notificaciones' },
        unread: { type: 'number', description: 'Notificaciones no leídas' },
        byType: {
          type: 'object',
          description: 'Notificaciones por tipo',
          additionalProperties: { type: 'number' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getMyStats(@CurrentUser() user: any) {
    return this.notificationsService.getStats(user.id);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída', type: Notification })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: any) {
    return this.notificationsService.markAsRead(id, user.id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Todas las notificaciones marcadas como leídas' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar notificación' })
  @ApiParam({ name: 'id', description: 'ID de la notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    await this.notificationsService.findOne(id, user.id);
    await this.notificationsService.remove(id, user.id);
    return { message: 'Notification deleted successfully' };
  }
}
