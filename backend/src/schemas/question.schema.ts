import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum QuestionType {
  TEXT = 'text',
  QUIZ = 'quiz',
}

export interface Question {
	id: string;
	content: string;
	type: 'text' | 'quiz';
	answers?: Array<{
		id: string;
		content: string;
	}>;
	correctAnswerId?: string;
}

// @Schema({ timestamps: true })
// export class Question extends Document {
//   @Prop({ required: true })
//   content: string;

//   @Prop({ required: true, enum: QuestionType })
//   type: QuestionType;

//   @Prop({ required: false })
//   correctAnswerId?: string;
// }

// export const QuestionSchema = SchemaFactory.createForClass(Question); 