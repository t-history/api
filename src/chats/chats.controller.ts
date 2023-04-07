import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { ChatDto } from './chat.dto';
import { MessageDto } from './message.dto';

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
    @Param('chatId') chatId: number,
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
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async getMessagesByChatId(
    @Param('chatId') chatId: number,
  ): Promise<MessageDto[]> | undefined {
    return await this.chatsService.getMessagesByChatId(chatId);
  }
}
