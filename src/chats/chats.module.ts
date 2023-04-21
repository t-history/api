import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { MongoClient } from 'mongodb';

@Module({
  controllers: [ChatsController],
  providers: [
    ChatsService,
    {
      provide: 'DATABASE_CONNECTION',
      useFactory: async () => {
        const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);
        await client.connect();
        return client;
      },
    },
  ],
})
export class ChatsModule {}
