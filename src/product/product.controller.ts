import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductDto, UpdateProductDto } from './dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { ParseImagePipe } from './pipe';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @GetUser('sub') userId,
    @Body() dto: ProductDto,
    @UploadedFile(ParseImagePipe)
    image: Express.Multer.File,
  ) {
    return this.productService.create(userId, dto, image);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtGuard)
  @Patch(':id')
  update(
    @GetUser('sub') userId,
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile(ParseImagePipe)
    image: Express.Multer.File,
  ) {
    return this.productService.update(userId, productId, dto, image);
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser('sub') userId, @Param('id') productId: string) {
    return this.productService.remove(userId, productId);
  }
}
