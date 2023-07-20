import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ProductModule } from './product/product.module';
import { MinioClientModule } from './minio-client/minio-client.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      dbName: 'task-one-internship',
    }),
    AuthModule,
    ProductModule,
    MinioClientModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
