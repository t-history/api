import {
  Controller,
  Post,
  Param,
  Body,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { QueueService } from './queue.service';

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

  // load only messages from the depth in unixtime
  @Post('chat/:chatId/:depth')
  @ApiOperation({
    summary:
      'Add a task to queue for sync the specified chat to the desired depth',
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
}
