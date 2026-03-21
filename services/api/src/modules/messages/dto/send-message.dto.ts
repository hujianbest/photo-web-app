import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  @IsNotEmpty()
  receiver_id: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}
