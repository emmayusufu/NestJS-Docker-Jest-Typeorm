import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { JwtService } from '@nestjs/jwt';

import { User } from '../database/schemas/user.model';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { Message } from '../database/schemas/message.model';
import { Post } from '../database/schemas/post.model';

/**
 * Service responsible for handling user-related operations.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Creates a new user with the provided registration data.
   * @param userRegistrationDto - The registration data for the user.
   * @returns The created user.
   * @throws Error if a user with similar email address or username already exists, or if the user registration fails.
   */
  async createUser(userRegistrationDto: UserRegistrationDto) {
    const saltOrRounds = 10;
    const password = userRegistrationDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);

    userRegistrationDto.password = hash;

    const existingUser = await this.userModel.findOne({
      where: {
        [Op.or]: [
          { emailAddress: userRegistrationDto.emailAddress },
          { username: userRegistrationDto.username },
        ],
      },
    });

    if (existingUser) {
      throw new ForbiddenException(
        'User with similar emailAddress or username already exists',
      );
    }

    try {
      return await this.userModel.create(userRegistrationDto);
    } catch (error) {
      throw new Error('Failed to register user');
    }
  }

  /**
   * Returns user credentials based on the id
   * @param id - The id of the user
   * @returns The user credentials
   * @throws Error if the user is not found
   * */

  async getUserCredentials(id: string) {
    const user = await this.userModel.findByPk(id, {
      include: [
        {
          model: Message,
        },
        {
          model: Post,
        },
      ],
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * Logs in a user with the provided login credentials.
   * @param userLoginDto  - The login credentials for the user.
   * @returns The logged-in user.
   * @throws Error if a user with the provided credentials is not found, or if the provided password is invalid.
   */
  async loginUser(userLoginDto: UserLoginDto) {
    const { emailAddress, password, username } = userLoginDto;

    const filter: { emailAddress?: string; username?: string } = {};

    if (emailAddress) {
      filter.emailAddress = emailAddress;
    }
    if (username) {
      filter.username = username;
    }

    if (!emailAddress && !username) {
      throw new Error('Either emailAddress or username must be provided');
    }

    const existingUser = await this.userModel.findOne({
      where: filter,
    });

    if (!existingUser) {
      throw new Error('User with credentials not found');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials were provided');
    }

    const payload = {
      sub: existingUser.id,
      username: existingUser.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Finds a user with the provided email address or username.
   * @param id - The id of the user.
   * @returns The found user.
   * @throws Error if a user with the provided email address or username is not found.
   */
  async findOne(id: string) {
    try {
      return await this.userModel.findOne({ where: { id } });
    } catch (error) {
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Finds all users.
   * @returns The list of all users.
   */
  async findAll() {
    try {
      return await this.userModel.findAll();
    } catch (error) {
      throw new Error('Failed to retrieve users');
    }
  }

  /**
   * Deletes a user with the provided id.
   * @param id - The id of the user.
   */
  async deleteUser(username: string) {
    try {
      const record = await this.userModel.findOne({ where: { username } });

      if (!record) {
        return;
      }

      await this.userModel.destroy({ where: { username } });
    } catch (error) {
      throw new Error('Failed to delete user');
    }
  }
}
