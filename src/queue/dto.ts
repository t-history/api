import { ApiProperty } from '@nestjs/swagger';

export class QueueStateDTO {
  wait?: number;
  completed?: number;
  failed?: number;
}

export class QueueResponseDTO {
  @ApiProperty({ example: 'Chat added to queue' })
  message: string;
}
