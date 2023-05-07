import { MessageDto } from './message.dto';
import { ApiProperty } from '@nestjs/swagger';

export type ChatStatus = 'queued' | 'in_progress' | 'idle';

export class ChatDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title?: string;
  @ApiProperty()
  lastMessage?: MessageDto;
  @ApiProperty()
  status: ChatStatus;
  @ApiProperty()
  type: string;
  @ApiProperty()
  isSynchronizable: boolean;
}
