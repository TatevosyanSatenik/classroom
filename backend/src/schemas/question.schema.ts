import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum QuestionType {
  TEXT = 'text',
  QUIZ = 'quiz',
}

@Schema({ timestamps: true })
export class Question extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true, enum: QuestionType })
  type: QuestionType;

  @Prop({ type: [{ id: String, content: String }], default: [] })
  answers: Array<{
    id: string;
    content: string;
  }>;

  @Prop({ required: true })
  classId: string;

  @Prop({ type: [String], default: [] })
  groupIds: string[];

  @Prop({ type: [String], default: [] })
  topicIds: string[];

  @Prop({ required: false })
  correctAnswerId?: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question); 