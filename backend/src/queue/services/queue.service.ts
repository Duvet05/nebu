import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('video-processing')
    private videoQueue: Queue,
    @InjectQueue('email-queue')
    private emailQueue: Queue
  ) {}

  async addVideoProcessingJob(data: {
    videoId: string;
    filePath: string;
    options?: any;
  }): Promise<void> {
    try {
      await this.videoQueue.add('process-video', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Video processing job added for video ${data.videoId}`);
    } catch (error) {
      this.logger.error(`Failed to add video processing job:`, error);
      throw error;
    }
  }

  async addEmailJob(data: {
    to: string;
    subject: string;
    template: string;
    context?: any;
  }): Promise<void> {
    try {
      await this.emailQueue.add('send-email', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 50,
        removeOnFail: 10,
      });

      this.logger.log(`Email job added for ${data.to}`);
    } catch (error) {
      this.logger.error(`Failed to add email job:`, error);
      throw error;
    }
  }

  async getQueueStats(): Promise<{
    video: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
    email: {
      waiting: number;
      active: number;
      completed: number;
      failed: number;
    };
  }> {
    try {
      const [videoStats, emailStats] = await Promise.all([
        this.videoQueue.getJobCounts(),
        this.emailQueue.getJobCounts(),
      ]);

      return {
        video: {
          waiting: videoStats.waiting,
          active: videoStats.active,
          completed: videoStats.completed,
          failed: videoStats.failed,
        },
        email: {
          waiting: emailStats.waiting,
          active: emailStats.active,
          completed: emailStats.completed,
          failed: emailStats.failed,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats:', error);
      throw error;
    }
  }

  async pauseQueue(queueName: string): Promise<void> {
    try {
      const queue = queueName === 'video' ? this.videoQueue : this.emailQueue;
      await queue.pause();
      this.logger.log(`Queue ${queueName} paused`);
    } catch (error) {
      this.logger.error(`Failed to pause queue ${queueName}:`, error);
      throw error;
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    try {
      const queue = queueName === 'video' ? this.videoQueue : this.emailQueue;
      await queue.resume();
      this.logger.log(`Queue ${queueName} resumed`);
    } catch (error) {
      this.logger.error(`Failed to resume queue ${queueName}:`, error);
      throw error;
    }
  }

  async clearQueue(queueName: string): Promise<void> {
    try {
      const queue = queueName === 'video' ? this.videoQueue : this.emailQueue;
      await queue.empty();
      this.logger.log(`Queue ${queueName} cleared`);
    } catch (error) {
      this.logger.error(`Failed to clear queue ${queueName}:`, error);
      throw error;
    }
  }
}
