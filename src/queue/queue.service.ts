import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { QueueStateDTO } from './dto';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('chatHistoryQueue') private queue: Queue) {}

  async addToQueue(
    chatId: number | null,
    depth: 'full' | 'sync' | number,
  ): Promise<void> {
    await this.queue.add('getChat', { chatId, depth });
  }

  async getQueueLength(): Promise<any> {
    const queueLength: QueueStateDTO = await this.queue.getJobCounts(
      'wait',
      'completed',
      'failed',
    );
    return queueLength;
  }
}
