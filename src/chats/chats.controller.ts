import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { ChatDto } from './chat.dto';
import { MessageDto } from './message.dto';
import { FromMessageIdDTO, LimitDTO } from './dto';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of chats' })
  @ApiResponse({
    status: 200,
    description: 'List of chats successfully obtained',
    type: [ChatDto],
  })
  async getChats(): Promise<ChatDto[]> {
    return await this.chatsService.getChats();
  }

  @Get(':chatId')
  @ApiOperation({ summary: 'Get chat details' })
  @ApiResponse({
    status: 200,
    description: 'Chat details successfully obtained',
    type: ChatDto,
  })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async getChatById(
    @Param('chatId', ParseIntPipe) chatId: number,
  ): Promise<ChatDto> | undefined {
    return await this.chatsService.getChatById(chatId);
  }

  @Get(':chatId/messages')
  @ApiOperation({ summary: 'Get chat messages' })
  @ApiResponse({
    status: 200,
    description: 'Chat messages successfully obtained',
    type: [MessageDto],
  })
  @ApiParam({ name: 'chatId', required: true, type: Number })
  @ApiQuery({ name: 'fromMessageId', required: false, type: FromMessageIdDTO })
  // @ApiQuery({ name: 'offset', required: false, type: OffsetDTO })
  @ApiQuery({ name: 'limit', required: false, type: LimitDTO })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async getMessagesByChatId(
    @Param('chatId', ParseIntPipe) chatId: number,
    @Query('fromMessageId', new DefaultValuePipe(0), ParseIntPipe)
    fromMessageId: number,
    // @Query('offset') offset = 0,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<MessageDto[]> | undefined {
    return await this.chatsService.getMessagesByChatId(
      chatId,
      fromMessageId,
      limit,
    );
  }
}
