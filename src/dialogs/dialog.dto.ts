import { MessageDto } from './message.dto';

export class DialogDto {
  id: number;
  title: string;
  lastMessage: MessageDto;
}
