import { Controller } from "@nestjs/common";
import { Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('user/:email')
	async getUserByEmail(@Param('email') email: string) {
		return this.usersService.findByEmail(email);
	}
}