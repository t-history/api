import { Module } from '@nestjs/common';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService,
      ): Promise<BullModule> => ({
        connection: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          // password: configService.get<string>('REDIS_PASSWORD'),
          username: configService.get<string>('process.env.REDIS_USERNAME'),
        },
      }),
    }),
    // BullModule.forRootAsync(
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   {
    //   connection: {
    //     host: process.env.REDIS_HOST,
    //     port: Number(process.env.REDIS_PORT),
    //     password: process.env.REDIS_PASSWORD,
    //     username: process.env.REDIS_USERNAME,
    //   },
    // }),
    BullModule.registerQueue({
      name: 'chatHistoryQueue',
    }),
    BullModule.registerQueue({
      name: 'chatQueue',
    }),
  ],
  controllers: [QueueController],
  providers: [QueueService],
})
export class QueueModule {}
