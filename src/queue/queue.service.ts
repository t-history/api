import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('chatHistoryQueue') private queue: Queue) {}

  async addToQueue(
    chatId: number | null,
    depth: 'full' | 'sync' | number,
  ): Promise<void> {
    await this.queue.add('getChat', { chatId, depth });
  }
}
