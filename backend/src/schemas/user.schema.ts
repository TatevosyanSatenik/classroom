import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

// export type UserDocument = HydratedDocument<User>;

// @Schema()
// export class User {
// 	@Prop({ required: true })
// 	email: string;

// 	@Prop({ required: true })
// 	role: "student" | "professor";

// 	@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' })
// 	answers: [];

// 	@Prop({ required: false })
// 	password: string;

// 	@Prop({ required: false })
// 	year: number;

// 	@Prop({ required: false })
// 	group: string;
// }

// export const UserSchema = SchemaFactory.createForClass(User);
