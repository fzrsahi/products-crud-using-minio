import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MinioClientModule } from 'src/minio-client/minio-client.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './schema/product.schema';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [
    MinioClientModule,
    MongooseModule.forFeature([
      {
        name: 'Product',
        schema: ProductSchema,
      },
    ]),
  ],
})
export class ProductModule {}
