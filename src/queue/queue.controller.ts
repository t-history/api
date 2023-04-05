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
  @ApiOperation({ summary: 'Add all dialogs to the export queue' })
  @ApiResponse({
    status: 200,
    description: 'All dialogs have been added to the export queue',
  })
  addToQueueAll(@Body('depth') depth: 'day' | 'week' | 'all'): void {
    this.queueService.addToQueue(null, depth);
  }

  @Post('dialog/:dialogId')
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
  @ApiOperation({ summary: 'Add a specific dialog to the export queue' })
  @ApiResponse({
    status: 200,
    description: 'The specified dialog has been added to the export queue',
  })
  @ApiResponse({ status: 404, description: 'Dialog not found' })
  addToQueueDialog(
    @Param('dialogId') dialogId: number,
    @Body('depth') depth: 'day' | 'week' | 'all',
  ): void {
    this.queueService.addToQueue(dialogId, depth);
  }
}
