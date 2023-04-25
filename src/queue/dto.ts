// import { ApiProperty } from '@nestjs/swagger';

export class QueueStateDTO {
  wait?: number;
  completed?: number;
  failed?: number;
}
