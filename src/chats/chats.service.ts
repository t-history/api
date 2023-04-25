import { Injectable, Inject } from '@nestjs/common';
import { ChatDto } from './chat.dto';
import { MessageDto } from './message.dto';
import { Db } from 'mongodb';

@Injectable()
export class ChatsService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  async getChats(): Promise<ChatDto[]> {
    const collection = this.db.collection('chats');
    console.log('getChats', collection);

    const cursor = collection
      .find({})
      .project({ id: 1, title: 1, last_message: 1 })
      .sort({ 'last_message.date': -1 });
    const docs = await cursor.toArray();

    const transformedDocs = docs.map((doc) => {
      const lastMessage = {
        id: doc.last_message?.id,
        sender: doc.last_message?.sender_id.user_id,
        content: doc.last_message?.content.text?.text,
        type: doc.last_message?.content._,
        unixtime: doc.last_message?.date,
      };

      return {
        id: doc.id,
        title: doc.title,
        lastMessage,
      };
    });

    return transformedDocs;
  }

  async getChatById(chatId: number): Promise<ChatDto> | undefined {
    const collection = this.db.collection('chats');

    const doc = await collection.findOne({ id: chatId });

    if (!doc) {
      return;
    }

    const lastMessage = {
      id: doc.last_message.id,
      sender: doc.last_message.sender_id?.user_id,
      content: doc.last_message?.content.text?.text,
      type: doc.last_message?.content._,
      unixtime: doc.last_message?.date,
    };

    return {
      id: doc.id,
      title: doc.title,
      lastMessage,
    };
  }

  async getMessagesByChatId(
    chatId: number,
    fromMessageId: number,
    limit: number,
  ): Promise<MessageDto[]> | undefined {
    const filter = fromMessageId === 0 ? {} : { id: { $lt: fromMessageId } };

    const collection = this.db.collection('messages');
    const cursor = collection
      .find({ chat_id: chatId, ...filter })
      .project({
        id: 1,
        'sender_id.user_id': 1,
        'content.text.text': 1,
        'content._': 1,
        date: 1,
      })
      .limit(limit)
      .sort({ date: -1 });

    const docs = await cursor.toArray();

    const transformedDocs = docs
      .map((doc) => {
        const text = doc.content?.text?.text;

        return {
          id: doc.id,
          sender: doc.sender_id.user_id,
          content: text,
          type: doc.content._,
          unixtime: doc.date,
        };
      })
      .reverse();

    return transformedDocs;
  }
}
