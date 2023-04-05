import { MessageDto } from './message.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DialogDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  lastMessage: MessageDto;
}
