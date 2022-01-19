import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { sign } from 'jsonwebtoken';
import { compare } from 'bcrypt';


import { JWT_SECRET } from '@app/config';
import { Utils } from '@app/utils';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { UserResponseInterface } from './types/userResponse.interface';
import { LoginUserDto } from './dto/loginUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
	) {}

	async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
		const userByEmail = await this.userRepository.findOne({ email: createUserDto.email });
		const userByUsername = await this.userRepository.findOne({ username: createUserDto.username });

		let errorResponse = { errors: {}};

		if (userByEmail) {
			errorResponse = Utils.createErrorResponse('email', 'has already been taken', errorResponse);
		}

		if (userByUsername) {
			errorResponse = Utils.createErrorResponse('username', 'has already been taken', errorResponse);
		}

		if (userByEmail || userByUsername) {
			throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
		}

		const newUser = new UserEntity();
		Object.assign(newUser, createUserDto);
		return await this.userRepository.save(newUser);
	}

	async login(loginUserDto: LoginUserDto): Promise<UserEntity> {
		const errorResponse = Utils.createErrorResponse('email or password', 'is invalid');

		const user = await this.userRepository.findOne(
			{ email: loginUserDto.email },
			{ select: ['id', 'username', 'email', 'bio', 'image', 'password']},
		);

		if (!user) {
			throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
		}

		const isPasswordValid = await compare(loginUserDto.password, user.password)
		if (!isPasswordValid) {
			throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
		}

		delete user.password;

		return user;
	}

	async updateUser(userId: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
		const errorResponse = Utils.createErrorResponse('user', 'does not exist');

		const user = await this.findById(userId);
		if (!user) {
			throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
		}

		Object.assign(user, updateUserDto);
		return await this.userRepository.save(user);
	}

	findById(id: number): Promise<UserEntity> {
		return this.userRepository.findOne(id)
	}

	generateJwt(user: UserEntity): string {
		const { id, username, email } = user;
		return sign({
			id,
			username,
			email
		}, JWT_SECRET);
	}

	buildUserResponse(user: UserEntity): UserResponseInterface {
		return {
			user: {
				...user,
				token: this.generateJwt(user),
			},
		};
	}
}
