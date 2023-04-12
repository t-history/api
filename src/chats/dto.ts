import { ApiProperty } from '@nestjs/swagger';

//dto.ts
export class FromMessageIdDTO {
  @ApiProperty({ default: 0, required: false })
  fromMessageId: number;
}

export class OffsetDTO {
  @ApiProperty({ default: 0, required: false })
  offset: number;
}

export class LimitDTO {
  @ApiProperty({ default: 100, required: false })
  limit: number;
}
