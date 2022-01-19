import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';

import { ExpressRequestInterface } from '@app/types/expressRequest.interface';
import { JWT_SECRET } from '@app/config';
import { UserService } from '../user.service';


@Injectable()
export class AuthMiddleware implements NestMiddleware {
	constructor(private readonly userService: UserService) {}
	async use(req: ExpressRequestInterface, res: Response, next: NextFunction) {
		if (!req.headers.authorization) {
			req.user = null;
			next();
			return;
		}

		const token = req.headers.authorization.split(' ')[1];

		try {
			const decode = <JwtPayload>verify(token, JWT_SECRET);
			const user = await this.userService.findById(decode.id);
			req.user = user;
			next();
		} catch (error) {
			req.user = null;
			next();
		}

	}
}
