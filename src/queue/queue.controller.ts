import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBody } from '@nestjs/swagger';
import { QueueService } from './queue.service';

@ApiTags('queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('all')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        depth: {
          type: 'string',
          enum: ['day', 'week', 'all'],
        },
      },
    },
  })
  @ApiOperation({ summary: 'Add all chats to the export queue' })
  @ApiResponse({
    status: 200,
    description: 'All chats have been added to the export queue',
  })
  addToQueueAll(@Body('depth') depth: 'day' | 'week' | 'all'): void {
    this.queueService.addToQueue(null, depth);
  }

  @Post('chat/:chatId')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        depth: {
          type: 'string',
          enum: ['day', 'week', 'all'],
        },
      },
    },
  })
  @ApiOperation({ summary: 'Add a specific chat to the export queue' })
  @ApiResponse({
    status: 200,
    description: 'The specified chat has been added to the export queue',
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  addToQueueChat(
    @Param('chatId') chatId: number,
    @Body('depth') depth: 'day' | 'week' | 'all',
  ): void {
    this.queueService.addToQueue(chatId, depth);
  }
}
