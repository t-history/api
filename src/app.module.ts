import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatsModule } from './chats/chats.module';
import { QueueModule } from './queue/queue.module';
import { DatabaseModule } from './database.module';
import { ExternalUpdatesModule } from './external-updates/external-updates.module';
import { BackupService } from './backup.service';
import { S3Service } from './s3.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ChatsModule,
    QueueModule,
    DatabaseModule,
    ExternalUpdatesModule,
  ],
  controllers: [AppController],
  providers: [AppService, BackupService, S3Service],
})
export class AppModule {}
