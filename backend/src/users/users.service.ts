import { Injectable } from "@nestjs/common";

const mockUsers = [
	{
		email: 'test@test.com',
		role: 'student',
		answers: [],
		year: 2,
		groupId: 'group1',
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
		groupId: 'group1',
	}
];

@Injectable()
export class UsersService {
	// constructor(@InjectModel(User.name) private userModel: Model<User>) {}

	async getStudents() {
		return mockUsers.filter((user) => user.role === 'student');
	}

	async findByEmail(email: string) {
		return mockUsers.find((user) => user.email === email);
		// return this.userModel.findOne({ email });
	}

	async validateProfessor(email: string, password: string) {
		const user = mockUsers.find((user) => user.email === email);
		return user?.password === password;
	}
}