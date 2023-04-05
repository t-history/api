import { ApiProperty } from '@nestjs/swagger';

export class MessageDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  sender: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  unixtime: number;
}
