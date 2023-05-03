import { MessageDto } from './message.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ChatDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title?: string;
  @ApiProperty()
  lastMessage?: MessageDto;
  @ApiProperty()
  status: 'queued' | 'in_progress' | 'idle';
  @ApiProperty()
  type: string;
  @ApiProperty()
  isSynchronizable: boolean;
}
