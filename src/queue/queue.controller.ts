import {
  Controller,
  Post,
  Get,
  Param,
  NotFoundException,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { QueueService } from './queue.service';
import { Response } from 'express';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  // With all chats --------------------------------

  // @Post('all')
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       depth: {
  //         type: 'string',
  //         enum: ['day', 'week', 'all'],
  //       },
  //     },
  //   },
  // })
  // @ApiOperation({ summary: 'Add all chats to the export queue' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'All chats have been added to the export queue',
  // })
  // addToQueueAll(@Body('depth') depth: 'full' | 'sync' | number): void {
  //   this.queueService.addToQueue(null, depth);
  // }

  // With single chatId ----------------------------

  // load all chat
  @Post('chat/:chatId/full')
  @ApiOperation({
    summary: 'Add a task to queue for fully sync the specified chat',
  })
  @ApiResponse({
    status: 201,
    description: 'The specified chat has been added to the export queue',
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  addToQueueChatFull(@Param('chatId', ParseIntPipe) chatId: number): void {
    this.queueService.addToQueue(chatId, 'full');
  }

  // load only new messages
  @Post('chat/:chatId/sync')
  @ApiOperation({
    summary:
      'Add a task to queue for sync the specified chat with the latest updates',
  })
  @ApiResponse({
    status: 201,
    description: 'The specified chat has been added to the export queue',
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  addToQueueChatSync(@Param('chatId', ParseIntPipe) chatId: number): void {
    this.queueService.addToQueue(chatId, 'sync');
  }

  // load only messages from the depth in seconds
  @Post('chat/:chatId/:depth')
  @ApiOperation({
    summary:
      'Add a task to queue for sync the specified chat to the desired depth in seconds',
  })
  @ApiResponse({
    status: 201,
    description: 'The specified chat has been added to the export queue',
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  addToQueueChatDepth(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('depth', ParseIntPipe) depth: number,
  ): void {
    if (depth < 0) {
      throw new NotFoundException('Chat not found');
    }
    this.queueService.addToQueue(chatId, depth);
  }

  @Get('length')
  @ApiOperation({ summary: 'Get queue length' })
  @ApiResponse({
    status: 200,
    description: 'Queue length successfully obtained',
    type: Number,
  })
  getQueueLength(): any {
    return this.queueService.getQueueLength();
  }

  @Get('sse')
  async sse(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');
    res.flushHeaders();

    const intervalId = setInterval(async () => {
      const queueState = await this.queueService.getQueueLength();
      // const time = new Date().toISOString();
      // console.log(time, queueState);
      res.write(`data: ${JSON.stringify(queueState)}\n\n`);
    }, 1000);

    // Maintain SSE connection for 59 seconds
    // Client reestablishes if needed
    const timeout = 59 * 1000;
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      res.end();
    }, timeout);

    res.on('close', () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      res.end();
    });
  }
}
