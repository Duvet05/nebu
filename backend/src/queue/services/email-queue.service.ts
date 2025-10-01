import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailQueueService {
  private readonly logger = new Logger(EmailQueueService.name);

  constructor(
    @InjectQueue('email-queue')
    private emailQueue: Queue
  ) {}

  async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.emailQueue.add(
        'send-email',
        {
          to,
          subject,
          template,
          context,
        },
        {
          priority: 1,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 50,
          removeOnFail: 10,
        }
      );

      this.logger.log(`Email queued for ${to}`);
    } catch (error) {
      this.logger.error(`Failed to queue email for ${to}:`, error);
      throw error;
    }
  }

  async sendBulkEmails(
    emails: Array<{
      to: string;
      subject: string;
      template: string;
      context?: Record<string, any>;
    }>
  ): Promise<void> {
    try {
      const jobs = emails.map(email => ({
        name: 'send-email',
        data: email,
        opts: {
          priority: 2,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 50,
          removeOnFail: 10,
        },
      }));

      await this.emailQueue.addBulk(jobs);

      this.logger.log(`${emails.length} emails queued for bulk sending`);
    } catch (error) {
      this.logger.error(`Failed to queue bulk emails:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(userId: string, userEmail: string, userName: string): Promise<void> {
    try {
      await this.sendEmail(userEmail, '¡Bienvenido a Nebu!', 'welcome', {
        userName,
        userId,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
      });

      this.logger.log(`Welcome email queued for ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to queue welcome email for ${userEmail}:`, error);
      throw error;
    }
  }

  async sendCourseEnrollmentEmail(
    userEmail: string,
    userName: string,
    courseName: string,
    courseId: string
  ): Promise<void> {
    try {
      await this.sendEmail(
        userEmail,
        `Te has inscrito en el curso: ${courseName}`,
        'course-enrollment',
        {
          userName,
          courseName,
          courseId,
          courseUrl: `${process.env.FRONTEND_URL}/courses/${courseId}`,
        }
      );

      this.logger.log(`Course enrollment email queued for ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to queue course enrollment email for ${userEmail}:`, error);
      throw error;
    }
  }

  async sendCourseCompletionEmail(
    userEmail: string,
    userName: string,
    courseName: string,
    courseId: string,
    certificateUrl?: string
  ): Promise<void> {
    try {
      await this.sendEmail(
        userEmail,
        `¡Felicidades! Has completado el curso: ${courseName}`,
        'course-completion',
        {
          userName,
          courseName,
          courseId,
          certificateUrl,
          courseUrl: `${process.env.FRONTEND_URL}/courses/${courseId}`,
        }
      );

      this.logger.log(`Course completion email queued for ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to queue course completion email for ${userEmail}:`, error);
      throw error;
    }
  }

  async sendPasswordResetEmail(
    userEmail: string,
    userName: string,
    resetToken: string
  ): Promise<void> {
    try {
      await this.sendEmail(
        userEmail,
        'Restablecer contraseña - Nebu',
        'password-reset',
        {
          userName,
          resetToken,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
        }
      );

      this.logger.log(`Password reset email queued for ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to queue password reset email for ${userEmail}:`, error);
      throw error;
    }
  }

  async sendNotificationEmail(
    userEmail: string,
    userName: string,
    notificationTitle: string,
    notificationMessage: string,
    actionUrl?: string
  ): Promise<void> {
    try {
      await this.sendEmail(userEmail, notificationTitle, 'notification', {
        userName,
        title: notificationTitle,
        message: notificationMessage,
        actionUrl,
      });

      this.logger.log(`Notification email queued for ${userEmail}`);
    } catch (error) {
      this.logger.error(`Failed to queue notification email for ${userEmail}:`, error);
      throw error;
    }
  }

  async getEmailQueueStatus(): Promise<any> {
    try {
      const jobs = await this.emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
      const counts = await this.emailQueue.getJobCounts();

      return {
        total: jobs.length,
        waiting: counts.waiting,
        active: counts.active,
        completed: counts.completed,
        failed: counts.failed,
        recentJobs: jobs.slice(0, 10).map(job => ({
          id: job.id,
          name: job.name,
          data: job.data,
          progress: job.progress(),
          state: job.opts.delay && job.opts.delay > Date.now() ? 'waiting' : 'active',
          createdAt: new Date(job.timestamp),
          processedAt: job.processedOn ? new Date(job.processedOn) : null,
          finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
          failedReason: job.failedReason,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get email queue status:', error);
      throw error;
    }
  }
}
