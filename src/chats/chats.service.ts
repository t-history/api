import { Injectable, Inject } from '@nestjs/common';
import { ChatDto } from './chat.dto';
import { MessageDto } from './message.dto';
import { Db } from 'mongodb';

@Injectable()
export class ChatsService {
  constructor(@Inject('DATABASE_CONNECTION') private db: Db) {}

  private chatProjection = {
    id: 1,
    title: 1,
    last_message: 1,
    status: 1,
    'type._': 1,
  };

  async getChats(): Promise<ChatDto[]> {
    const collection = this.db.collection('chats');

    const cursor = collection
      .find({})
      .project(this.chatProjection)
      .sort({ 'last_message.date': -1 });
    const docs = await cursor.toArray();

    const transformedDocs = docs.map(this.transformChat);

    return transformedDocs;
  }

  async getTransformedChatById(chatId: number): Promise<ChatDto> | undefined {
    const chat = this.getChatById(chatId);

    if (!chat) {
      return;
    }

    const transformedDoc = this.transformChat(chat);

    return transformedDoc;
  }

  async getChatById(chatId: number): Promise<any> | undefined {
    const collection = this.db.collection('chats');
    const doc = await collection.findOne({ id: chatId });

    return doc;
  }

  async getMessagesByChatId(
    chatId: number,
    fromMessageId: number,
    limit: number,
  ): Promise<MessageDto[]> | undefined {
    const chat = await this.getChatById(chatId);
    const chatTypeIsPrivate = ChatsService.isPrivateChat(chat);

    if (!chatTypeIsPrivate) {
      return [];
    }

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
  private transformChat(chat: any): ChatDto {
    const chatTypeIsPrivate = ChatsService.isPrivateChat(chat);

    const lastMessage = {
      id: chat.last_message?.id,
      sender: chat.last_message?.sender_id.user_id,
      content: chatTypeIsPrivate ? chat.last_message?.content.text?.text : '',
      type: chatTypeIsPrivate ? chat.last_message?.content._ : '',
      unixtime: chat.last_message?.date,
    };

    return {
      id: chat.id,
      title: chat.title,
      status: chat.status,
      type: chat.type._,
      lastMessage,
      isSynchronizable: chatTypeIsPrivate,
    };
  }

  static isPrivateChat(chat: any): boolean {
    return chat?.type._ === 'chatTypePrivate';
  }
}
