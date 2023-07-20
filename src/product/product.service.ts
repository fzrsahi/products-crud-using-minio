import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/product.schema';
import mongoose, { isValidObjectId } from 'mongoose';
import { Response } from './../types';
import path from 'path';

@Injectable()
export class ProductService {
  constructor(
    private minioClientService: MinioClientService,
    @InjectModel(Product.name)
    private readonly productModel: mongoose.Model<Product>,
  ) {}
  async create(
    userId: string,
    dto: ProductDto,
    image: Express.Multer.File,
  ): Promise<Response> {
    try {
      const uploadImage = await this.minioClientService.upload(image);
      const createProduct = await this.productModel.create({
        name: dto.name,
        description: dto.price,
        price: dto.price,
        image: uploadImage.url,
        user: userId,
      });

      return {
        statusCode: 201,
        message: 'Success Create Product',
        data: createProduct,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  async findAll(): Promise<Response> {
    const products = await this.productModel.find({}).populate({
      path: 'user',
      select: 'name',
    });
    return {
      statusCode: 200,
      message: 'Success Get All Products',
      data: products,
    };
  }

  async findOne(id: string): Promise<Response> {
    try {
      if (!isValidObjectId(id)) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Id is not valid',
        } as Response);
      }
      const product = await this.productModel
        .find({
          _id: id,
        })
        .populate({
          path: 'user',
          select: 'name',
        });

      if (!product.length) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'Product Not Found',
        } as Response);
      }

      return {
        statusCode: 200,
        message: `Success Get Product id : ${id}`,
        data: product,
      };
    } catch (error) {
      throw error;
    }
  }

  async update(
    userId: string,
    productId: string,
    dto: UpdateProductDto,
    image: Express.Multer.File,
  ): Promise<Response> {
    try {
      if (!isValidObjectId(productId)) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Id is not valid',
        } as Response);
      }
      const product = await this.productModel.findOne({
        _id: productId,
        user: userId,
      });

      const handledImageUrl = await this.handleProductImage(
        image,
        product,
        this.minioClientService,
      );
      const handleProduct = this.handleProductDTO(dto, product);

      const updateProduct = await this.productModel.updateOne(
        {
          _id: productId,
          user: userId,
        },
        {
          $set: {
            name: handleProduct.name,
            description: handleProduct.description,
            price: handleProduct.price,
            image: handledImageUrl,
          },
        },
      );
      return {
        statusCode: 201,
        message: `Success Update Product Id : ${productId}`,
        data: updateProduct,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  async remove(userId: string, productId: string): Promise<Response> {
    try {
      if (!isValidObjectId(productId)) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Id is not valid',
        } as Response);
      }
      const removeProduct = await this.productModel.deleteOne({
        _id: productId,
        user: userId,
      });

      return {
        statusCode: 200,
        message: `Success delete product Id : ${productId}`,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
      };
    }
  }

  handleProductDTO(dto: any, product: any) {
    const name = dto.name || product.name;
    const description = dto.description || product.description;
    const price = dto.price || product.price;

    return {
      name,
      description,
      price,
    };
  }

  async handleProductImage(image: any, product: any, minioClientService: any) {
    let imageUrl;

    if (!image) {
      imageUrl = product.image;
    } else {
      const uploadedImage = await minioClientService.upload(image);
      imageUrl = uploadedImage.url;

      const imageObject = product.image.substring(
        product.image.lastIndexOf('/') + 1,
      );
      await minioClientService.delete(imageObject);
    }

    return imageUrl;
  }
}
