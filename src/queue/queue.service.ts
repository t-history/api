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
    @InjectQueue('chatQueue') private chatQueue: Queue,
    @Inject('DATABASE_CONNECTION') private db: Db,
  ) {}

  async addToQueueChat(
    chatId: number | null,
    depth: 'full' | 'sync' | number,
  ): Promise<void> {
    console.log('addToQueueChat', chatId, depth);
    const doc = await this.db.collection('chats').findOne({ id: chatId });
    if (!doc) {
      throw new NotFoundException('Chat not found');
    }

    if (doc.th_status !== 'idle') {
      throw new ConflictException('Chat already in queue');
    }

    await this.db
      .collection('chats')
      .updateOne({ id: chatId }, { $set: { th_status: 'queued' } });
    await this.chatQueue.add('getChat', { chatId, depth });
  }

  async addToQueueUpdateAll(): Promise<void> {
    await this.chatQueue.add('getChatList', {});
  }

  async getQueueLength(): Promise<QueueStateDTO> {
    // find no equal to idle
    const chatsStatus = await this.db
      .collection('chats')
      .find({ th_status: { $ne: 'idle' }, 'type._': 'chatTypePrivate' })
      .project({ id: 1, th_status: 1 })
      .toArray();

    const chatsCount = await this.db.collection('chats').countDocuments({});
    const chatsCountByStatus = await this.db
      .collection('chats')
      .aggregate([
        {
          $group: {
            _id: '$th_status',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const chatsStatusMap = chatsStatus.reduce((acc, chat) => {
      acc[chat.id] = chat.th_status;
      return acc;
    }, {});

    const queueFailedLength = await this.chatQueue.getJobCounts(
      'failed',
      'wait',
    );

    const repeatableJobs = await this.chatQueue.getRepeatableJobs();
    const getChatListJob = repeatableJobs.find(
      (job) => job.name === 'getChatList',
    );

    return {
      chatsStatus: chatsStatusMap,
      idle:
        chatsCountByStatus.find((th_status) => th_status._id === 'idle')
          ?.count || 0,
      queued:
        chatsCountByStatus.find((th_status) => th_status._id === 'queued')
          ?.count || 0,
      in_progress:
        chatsCountByStatus.find((th_status) => th_status._id === 'in_progress')
          ?.count || 0,
      failed: queueFailedLength.failed,
      wait: queueFailedLength.wait || 0,
      chatsCount,
      nextChatListJob: getChatListJob?.next,
      periodChatListJob: Number(getChatListJob?.pattern),
    };
  }
}
