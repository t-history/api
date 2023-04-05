import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DialogsModule } from './dialogs/dialogs.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [ConfigModule.forRoot(), DialogsModule, QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
