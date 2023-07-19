import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './schemas/auth.schema';
import * as bcrypt from 'bcrypt';
import { Response, ResponseWithToken } from '../types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: mongoose.Model<User>,
    private JwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Response> {
    const hash = await bcrypt.hash(dto.password, 10);
    dto.password = hash;

    try {
      const createUser = await this.userModel.create(dto);
      createUser.password = null;
      return {
        statusCode: 201,
        message: 'Success Create Account',
        data: createUser,
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException({
          statusCode: 400,
          message: 'Username or Email Already Exist!',
        } as Response);
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<ResponseWithToken> {
    const user = await this.userModel.findOne({
      username: dto.username,
    });

    try {
      if (!user) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'Account Not Found!',
        } as Response);
      }

      const pwMatches = await bcrypt.compare(dto.password, user.password);
      if (!pwMatches) {
        throw new NotFoundException({
          statusCode: 404,
          message: 'Account Not Found!',
        } as Response);
      }

      const token = await this.getToken(user.id, user.username);

      return {
        statusCode: 200,
        message: 'Success Login',
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  async getToken(userId: string, username: string): Promise<string> {
    const accessToken = this.JwtService.signAsync(
      {
        sub: userId,
        username,
      },
      {
        expiresIn: '1d',
        secret: process.env.SECRET_KEY,
      },
    );
    return accessToken;
  }
}
