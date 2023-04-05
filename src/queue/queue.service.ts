import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('chatHistoryQueue') private queue: Queue) {}

  async addToQueue(
    dialogId: number | null,
    depth: 'day' | 'week' | 'all',
  ): Promise<void> {
    await this.queue.add('chatHistoryQueue', { chatId: dialogId, depth });
  }
}
