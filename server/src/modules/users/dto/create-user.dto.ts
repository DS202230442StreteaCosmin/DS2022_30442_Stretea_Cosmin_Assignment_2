import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;
}

export class CreateUserByAdminDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}
