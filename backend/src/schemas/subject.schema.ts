import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Subject extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [{ name: String, description: String }], default: [] })
  topics: Array<{
    name: string;
    description: string;
  }>;
}

export const SubjectSchema = SchemaFactory.createForClass(Subject); 