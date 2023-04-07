import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatsModule } from './chats/chats.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [ConfigModule.forRoot(), ChatsModule, QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
