import { Injectable, Inject } from '@nestjs/common';
import { ChatDto } from './chat.dto';
import { MessageDto } from './message.dto';
import { Db, MongoClient } from 'mongodb';

// import Datastore from '@seald-io/nedb';
import path from 'path';

@Injectable()
export class ChatsService {
  private db: Db;

  constructor(@Inject('DATABASE_CONNECTION') private dbClient: MongoClient) {
    this.db = this.dbClient.db('thistory');
  }

  async getChats(): Promise<ChatDto[]> {
    const collection = await this.db.collection('chats');

    const cursor = collection
      .find({})
      .project({ id: 1, title: 1, last_message: 1 })
      .sort({ 'last_message.date': -1 });
    const docs = await cursor.toArray();

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
    return;
    // const db = new Datastore({
    //   filename: databasePath,
    //   autoload: true,
    // });

    // const doc = await db.findOneAsync(
    //   { _id: chatId },
    //   { id: 1, title: 1, last_message: 1 },
    // );

    // if (!doc) {
    //   return;
    // }

    // const lastMessage = {
    //   id: doc.last_message.id,
    //   sender: doc.last_message.sender_id?.user_id,
    //   content: doc.last_message?.content?.text?.text,
    //   unixtime: doc.last_message?.date,
    // };

    // return {
    //   id: doc.id,
    //   title: doc.title,
    //   lastMessage,
    // };
  }

  async getMessagesByChatId(
    chatId: number,
    fromMessageId: number,
    limit: number,
  ): Promise<MessageDto[]> | undefined {
    return;
    // const databasePath = path.join(
    //   process.env.DATABASE_PATH,
    //   'chats',
    //   `${chatId}.db`,
    // );
    // const db = new Datastore({
    //   filename: databasePath,
    //   autoload: true,
    // });

    // const query = fromMessageId === 0 ? {} : { id: { $lt: fromMessageId } };

    // const docs = await db
    //   .findAsync(query)
    //   .projection({
    //     id: 1,
    //     'sender_id.user_id': 1,
    //     'content.text.text': 1,
    //     date: 1,
    //   })
    //   .limit(limit)
    //   .sort({ date: -1 });

    // const transformedDocs = docs
    //   .map((doc) => {
    //     const text = doc.content?.text?.text;

    //     return {
    //       id: doc.id,
    //       sender: doc.sender_id.user_id,
    //       content: text,
    //       unixtime: doc.date,
    //     };
    //   })
    //   .reverse();

    // return transformedDocs;
  }
}
