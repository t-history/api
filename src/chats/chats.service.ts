import { Injectable } from '@nestjs/common';
import { ChatDto } from './chat.dto';
import { MessageDto } from './message.dto';

import Datastore from '@seald-io/nedb';
import path from 'path';

@Injectable()
export class ChatsService {
  async getChats(): Promise<ChatDto[]> {
    const databasePath = path.join(process.env.DATABASE_PATH, 'chats.db');
    const db = new Datastore({
      filename: databasePath,
      autoload: true,
    });

    const docs = await db
      .findAsync({}, { id: 1, title: 1, last_message: 1 })
      .sort({ 'last_message.date': -1 });

    const transformedDocs = docs.map((doc) => {
      const lastMessage = {
        id: doc.last_message?.id,
        sender: doc.last_message?.sender_id.user_id,
        content: doc.last_message?.content?.text?.text,
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
    const databasePath = path.join(process.env.DATABASE_PATH, 'chats.db');
    const db = new Datastore({
      filename: databasePath,
      autoload: true,
    });

    const doc = await db.findOneAsync(
      { _id: Number(chatId) },
      { id: 1, title: 1, last_message: 1 },
    );

    if (!doc) {
      return;
    }

    const lastMessage = {
      id: doc.last_message.id,
      sender: doc.last_message.sender_id?.user_id,
      content: doc.last_message?.content?.text?.text,
      unixtime: doc.last_message?.date,
    };

    return {
      id: doc.id,
      title: doc.title,
      lastMessage,
    };
  }

  async getMessagesByChatId(chatId: number): Promise<MessageDto[]> | undefined {
    const databasePath = path.join(
      process.env.DATABASE_PATH,
      'chats',
      `${chatId}.db`,
    );
    const db = new Datastore({
      filename: databasePath,
      autoload: true,
    });

    const docs = await db
      .findAsync({})
      .projection({
        id: 1,
        'sender_id.user_id': 1,
        'content.text.text': 1,
        date: 1,
      })
      .sort({ date: -1 });

    const transformedDocs = docs.map((doc) => {
      const text = doc.content?.text?.text;

      return {
        id: doc.id,
        sender: doc.sender_id.user_id,
        content: text,
        unixtime: doc.date,
      };
    });

    return transformedDocs;
  }
}
