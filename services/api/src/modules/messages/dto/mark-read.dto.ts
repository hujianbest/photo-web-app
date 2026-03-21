import { IsNotEmpty, IsNumber, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class MarkReadDto {
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  @Type(() => Number)
  message_ids: number[];
}
