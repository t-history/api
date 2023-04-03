import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { DialogsService } from './dialogs.service';
import { DialogDto } from './dialog.dto';
import { MessageDto } from './message.dto';

@ApiTags('dialogs')
@Controller('dialogs')
export class DialogsController {
  constructor(private readonly dialogsService: DialogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of dialogs' })
  @ApiResponse({
    status: 200,
    description: 'List of dialogs successfully obtained',
    type: [DialogDto],
  })
  async getDialogs(): Promise<DialogDto[]> {
    return await this.dialogsService.getDialogs();
  }

  @Get(':dialogId')
  @ApiOperation({ summary: 'Get dialog details' })
  @ApiResponse({
    status: 200,
    description: 'Dialog details successfully obtained',
    type: DialogDto,
  })
  @ApiResponse({ status: 404, description: 'Dialog not found' })
  async getDialogById(
    @Param('dialogId') dialogId: number,
  ): Promise<DialogDto> | undefined {
    return await this.dialogsService.getDialogById(dialogId);
  }

  @Get(':dialogId/messages')
  @ApiOperation({ summary: 'Get dialog messages' })
  @ApiResponse({
    status: 200,
    description: 'Dialog messages successfully obtained',
    type: [MessageDto],
  })
  @ApiResponse({ status: 404, description: 'Dialog not found' })
  async getMessagesByDialogId(
    @Param('dialogId') dialogId: number,
  ): Promise<MessageDto[]> | undefined {
    return await this.dialogsService.getMessagesByDialogId(dialogId);
  }
}
