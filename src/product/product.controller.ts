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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiOperation({
    description: `This Endpoint Handle Create Product`,
  })
  @ApiResponse({
    status: 201,
    description: 'Product Created',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: ' If there are invalid input values ',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
        price: {
          type: 'number',
          format: 'number',
        },
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
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

  @ApiOperation({
    description: `This Endpoint Handle Get All Products`,
  })
  @ApiResponse({
    status: 200,
    description: 'Return All Product',
  })
  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @ApiOperation({
    description: `This Endpoint Handle Get Spesific Product by Id`,
  })
  @ApiResponse({
    status: 200,
    description: 'Return Spesific Product by Id',
  })
  @ApiResponse({
    status: 404,
    description: 'Product Not Found',
  })
  @ApiResponse({
    status: 400,
    description: 'Id Not valid',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
        image: {
          type: 'string',
          format: 'binary',
        },
        price: {
          type: 'number',
          format: 'number',
        },
      },
    },
  })
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    description: `This Endpoint Handle Update Product`,
  })
  @ApiResponse({
    status: 201,
    description: 'Product Updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: ' If there are invalid input values ',
  })
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

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    description: `This Endpoint Handle delete Product`,
  })
  @ApiResponse({
    status: 200,
    description: 'Product Updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 400,
    description: ' Id not valid ',
  })
  @UseGuards(JwtGuard)
  @Delete(':id')
  remove(@GetUser('sub') userId, @Param('id') productId: string) {
    return this.productService.remove(userId, productId);
  }
}
