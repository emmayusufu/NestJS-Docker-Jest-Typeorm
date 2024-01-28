import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { UsersService } from './users.service';

/**
 * Controller responsible for handling user-related operations.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  /**
   * Endpoint for user registration.
   * @param userRegistrationDto - The user registration data.
   * @returns The created user.
   */
  @Post('/registration')
  registration(@Body() userRegistrationDto: UserRegistrationDto) {
    return this.userService.createUser(userRegistrationDto);
  }

  /**
   * Endpoint for user login.
   * @param userLoginDto - The user login data.
   * @returns The logged-in user.
   */
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  login(@Body() userLoginDto: UserLoginDto) {
    return this.userService.loginUser(userLoginDto);
  }

  /**
   * Endpoint to get all users.
   * @returns All users.
   */
  @Get('/')
  getAllUsers() {
    return this.userService.findAll();
  }

  /**
   * Endpoint to get a single user by ID.
   * @param id - The user ID.
   * @returns The user with the specified ID.
   */
  @Get('/:id')
  getUserById(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  /**
   * Delete a user by ID.
   * @param id - The user ID.
   */
  @Post('/delete/:username')
  deleteUserById(@Param('usernamae') username: string) {
    return this.userService.deleteUser(username);
  }
}
