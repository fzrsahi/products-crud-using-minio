import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Product } from 'src/product/schema/product.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({})
export class User {
  @Prop()
  name: string;

  @Prop({
    unique: true,
  })
  username: string;

  @Prop({
    unique: true,
  })
  email: string;

  @Prop()
  password: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  products: Product[];
}

export const UserSchema = SchemaFactory.createForClass(User);
