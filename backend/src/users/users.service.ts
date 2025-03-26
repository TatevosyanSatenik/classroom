import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
// import { User } from "src/schemas/user.schema";

const mockUsers = [
	{
		email: 'test@test.com',
		role: 'student',
		answers: [],
		year: 2,
		group: 'A',
	},
	{
		email: 'test2@test.com',
		role: 'professor',
		answers: [],
		password: 'test',
	},
	{
		email: 'test3@test.com',
		role: 'student',
		answers: [],
		year: 2,
		group: 'A',
	}
];

@Injectable()
export class UsersService {
	// constructor(@InjectModel(User.name) private userModel: Model<User>) {}

	async findByEmail(email: string) {
		return mockUsers.find((user) => user.email === email);
		// return this.userModel.findOne({ email });
	}

	async validateProfessor(email: string, password: string) {
		const user = mockUsers.find((user) => user.email === email);
		return user?.password === password;
	}
}