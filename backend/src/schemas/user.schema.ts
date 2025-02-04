import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
	@Prop({ required: true })
	email: string;

	@Prop({ required: true })
	role: "student" | "professor";

	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' })
	answers: []
}

export const UserSchema = SchemaFactory.createForClass(User);
