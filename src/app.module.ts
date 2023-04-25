import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatsModule } from './chats/chats.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database.module';

@Module({
  imports: [ConfigModule.forRoot(), ChatsModule, QueueModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
