import { ApiProperty } from '@nestjs/swagger';
import { ChatStatus } from '../chats/chat.dto';

export class QueueResponseDTO {
  @ApiProperty({ example: 'Chat added to queue' })
  message: string;
}

export class QueueStateDTO {
  // chats
  idle: number;
  queued: number;
  in_progress: number;
  // queue
  completed?: number;
  failed: number;
  wait: number;

  chatsStatus: {
    [key: number]: ChatStatus;
  };
  chatsCount: number;
  nextChatListJob: number | null;
  periodChatListJob: number | null;
}
