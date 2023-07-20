import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductDto {
  // @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  // @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  // @ApiProperty()
  @IsNotEmpty()
  price: number;
}
