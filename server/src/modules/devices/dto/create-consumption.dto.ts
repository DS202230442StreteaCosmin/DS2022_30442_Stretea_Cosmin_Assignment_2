import { ApiProperty } from '@nestjs/swagger';

export class CreateConsumptionDto {
  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  value: number;
}
