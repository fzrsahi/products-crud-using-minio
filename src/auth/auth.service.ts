import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Auth } from './schemas/auth.schema';
import * as bcrypt from 'bcrypt';
import { Response } from './../response';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name) private readonly authModel: mongoose.Model<Auth>,
  ) {}

  async register(dto: RegisterDto): Promise<Response> {
    const hash = await bcrypt.hash(dto.password, 10);
    dto.password = hash;

    try {
      const createUser = await this.authModel.create(dto);
      createUser.password = null;
      return {
        success: true,
        statusCode: 201,
        message: 'Success Create Account',
        data: createUser,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException({
          success: false,
          statusCode: 400,
          message: 'Username or Email Already Exist!',
        } as Response);
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<Response> {
    const findUser = await this.authModel.findOne({
      username: dto.username,
    });

    try {
      if (!findUser) {
        throw new NotFoundException({
          success: false,
          statusCode: 404,
          message: 'Account Not Found!',
        } as Response);
      }
      const pwMatches = await bcrypt.compare(dto.password, findUser.password);
      if (!pwMatches) {
        throw new NotFoundException({
          success: false,
          statusCode: 404,
          message: 'Account Not Found!',
        } as Response);
      }

      return {
        success: true,
        statusCode: 200,
        message: 'Success Login',
      };
    } catch (error) {
      throw error;
    }
  }
}
