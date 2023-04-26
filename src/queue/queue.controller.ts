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
import { QueueResponseDTO } from './dto';

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
  //   const res await=  this.queueService.addToQueue(null, depth);
  // return
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
  async addToQueueChatFull(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<QueueResponseDTO> {
    await this.queueService.addToQueue(chatId, 'full');

    return {
      message: 'The chat has been added to queue',
    };
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
  async addToQueueChatSync(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<QueueResponseDTO> {
    await this.queueService.addToQueue(chatId, 'sync');

    return {
      message: 'The chat has been added to queue',
    };
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
  async addToQueueChatDepth(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Param('depth', ParseIntPipe) depth: number,
  ): Promise<QueueResponseDTO> {
    if (depth < 0) {
      throw new NotFoundException('Chat not found');
    }
    await this.queueService.addToQueue(chatId, depth);

    return {
      message: 'The chat has been added to queue',
    };
  }

  // @Get('length')
  // @ApiOperation({ summary: 'Get queue length' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Queue length successfully obtained',
  //   type: Number,
  // })
  // getQueueLength(): any {
  //   return this.queueService.getQueueLength();
  // }

  @Get('sse')
  async sse(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');
    res.flushHeaders();

    const intervalId = setInterval(async () => {
      const queueState = await this.queueService.getQueueLength();
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
