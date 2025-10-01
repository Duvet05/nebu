import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class VideoProcessingService {
  private readonly logger = new Logger(VideoProcessingService.name);

  constructor(
    @InjectQueue('video-processing')
    private videoQueue: Queue
  ) {}

  async processVideo(
    videoId: string,
    filePath: string,
    options: {
      generateThumbnail?: boolean;
      createMultipleResolutions?: boolean;
      extractAudio?: boolean;
      generateSubtitles?: boolean;
    } = {}
  ): Promise<void> {
    try {
      await this.videoQueue.add(
        'process-video',
        {
          videoId,
          filePath,
          options: {
            generateThumbnail: true,
            createMultipleResolutions: true,
            extractAudio: false,
            generateSubtitles: false,
            ...options,
          },
        },
        {
          priority: 1,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        }
      );

      this.logger.log(`Video processing job queued for video ${videoId}`);
    } catch (error) {
      this.logger.error(`Failed to queue video processing for ${videoId}:`, error);
      throw error;
    }
  }

  async generateThumbnail(
    videoId: string,
    filePath: string,
    timestamp: number = 10
  ): Promise<void> {
    try {
      await this.videoQueue.add(
        'generate-thumbnail',
        {
          videoId,
          filePath,
          timestamp,
        },
        {
          priority: 2,
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 1000,
          },
          removeOnComplete: 20,
          removeOnFail: 10,
        }
      );

      this.logger.log(`Thumbnail generation queued for video ${videoId}`);
    } catch (error) {
      this.logger.error(`Failed to queue thumbnail generation for ${videoId}:`, error);
      throw error;
    }
  }

  async createMultipleResolutions(
    videoId: string,
    filePath: string,
    resolutions: string[] = ['720p', '480p', '360p']
  ): Promise<void> {
    try {
      await this.videoQueue.add(
        'create-resolutions',
        {
          videoId,
          filePath,
          resolutions,
        },
        {
          priority: 1,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 5,
          removeOnFail: 3,
        }
      );

      this.logger.log(`Multiple resolutions queued for video ${videoId}`);
    } catch (error) {
      this.logger.error(`Failed to queue multiple resolutions for ${videoId}:`, error);
      throw error;
    }
  }

  async extractAudio(videoId: string, filePath: string, format: string = 'mp3'): Promise<void> {
    try {
      await this.videoQueue.add(
        'extract-audio',
        {
          videoId,
          filePath,
          format,
        },
        {
          priority: 3,
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 2000,
          },
          removeOnComplete: 15,
          removeOnFail: 5,
        }
      );

      this.logger.log(`Audio extraction queued for video ${videoId}`);
    } catch (error) {
      this.logger.error(`Failed to queue audio extraction for ${videoId}:`, error);
      throw error;
    }
  }

  async generateSubtitles(
    videoId: string,
    filePath: string,
    language: string = 'en'
  ): Promise<void> {
    try {
      await this.videoQueue.add(
        'generate-subtitles',
        {
          videoId,
          filePath,
          language,
        },
        {
          priority: 4,
          attempts: 2,
          backoff: {
            type: 'fixed',
            delay: 3000,
          },
          removeOnComplete: 10,
          removeOnFail: 5,
        }
      );

      this.logger.log(`Subtitle generation queued for video ${videoId}`);
    } catch (error) {
      this.logger.error(`Failed to queue subtitle generation for ${videoId}:`, error);
      throw error;
    }
  }

  async getVideoProcessingStatus(videoId: string): Promise<any> {
    try {
      const jobs = await this.videoQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
      const videoJobs = jobs.filter(job => job.data.videoId === videoId);

      return {
        videoId,
        totalJobs: videoJobs.length,
        waiting: videoJobs.filter(job => job.opts.delay && job.opts.delay > Date.now()).length,
        active: videoJobs.filter(job => job.opts.delay && job.opts.delay <= Date.now()).length,
        completed: videoJobs.filter(job => job.finishedOn).length,
        failed: videoJobs.filter(job => job.failedReason).length,
        jobs: videoJobs.map(job => ({
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
      this.logger.error(`Failed to get video processing status for ${videoId}:`, error);
      throw error;
    }
  }
}
