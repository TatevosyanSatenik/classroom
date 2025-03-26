import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';

@Controller('user')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Post()
	async login(@Body() loginDto: LoginDto) {
		try {
			const user = await this.usersService.findByEmail(loginDto.email);
			
			if (!user) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}

			return user;
		} catch (error) {
			if (error instanceof HttpException) {
				throw error;
			}
			throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}
}
