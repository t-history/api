import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Db } from 'mongodb';

import { QueueStateDTO } from './dto';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('chatHistoryQueue') private queue: Queue,
    @Inject('DATABASE_CONNECTION') private db: Db,
  ) {}

  async addToQueue(
    chatId: number | null,
    depth: 'full' | 'sync' | number,
  ): Promise<void> {
    const doc = await this.db.collection('chats').findOne({ id: chatId });
    if (!doc) {
      throw new NotFoundException('Chat not found');
    }

    if (doc.status !== 'idle') {
      throw new ConflictException('Chat already in queue');
    }

    await this.db
      .collection('chats')
      .updateOne({ id: chatId }, { $set: { status: 'wait' } });
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
