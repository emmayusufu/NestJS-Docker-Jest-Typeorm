import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { User } from '../database/schemas/user.model';
import { UserLoginDto } from './dtos/user-login.dto';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { JwtModule } from '@nestjs/jwt';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: typeof User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
      imports: [JwtModule.register({ secret: 'your-secret-key' })],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<typeof User>(getModelToken(User));
  });

  describe('createUser', () => {
    it('should create a new user and return the created user', async () => {
      const userRegistrationDto: UserRegistrationDto = {
        emailAddress: 'test@example.com',
        username: 'testuser',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };

      const hash = await bcrypt.hash(userRegistrationDto.password, 10);
      const createdUser = { ...userRegistrationDto, password: hash };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      jest.spyOn(userModel, 'create').mockResolvedValue(createdUser);

      const result = await service.createUser(userRegistrationDto);

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { emailAddress: userRegistrationDto.emailAddress },
            { username: userRegistrationDto.username },
          ],
        },
      });
      expect(userModel.create).toHaveBeenCalledWith(userRegistrationDto);
      expect(result).toEqual(createdUser);
    });

    it('should throw a ForbiddenException if a user with similar email address or username already exists', async () => {
      const userRegistrationDto: UserRegistrationDto = {
        emailAddress: 'existing@example.com',
        username: 'existingUser',
        password: 'securePassword',
        firstName: 'Existing',
        lastName: 'User',
      };

      const existingUserMock: Partial<User> = {
        id: 'uuid-mock-id',
        emailAddress: 'existing@example.com',
        username: 'existingUser',
        password: 'hashedPassword',
        firstName: 'Existing',
        lastName: 'User',
        save: jest.fn(),
        destroy: jest.fn(),
        update: jest.fn(),
      };

      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValue(existingUserMock as User);

      await expect(service.createUser(userRegistrationDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw an error if user registration fails', async () => {
      const userRegistrationDto: UserRegistrationDto = {
        emailAddress: 'test@example.com',
        username: 'testuser',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);
      jest
        .spyOn(userModel, 'create')
        .mockRejectedValue(new Error('Failed to register user'));

      await expect(service.createUser(userRegistrationDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('loginUser', () => {
    it('should log in a user and return the access token', async () => {
      const userLoginDto: UserLoginDto = {
        emailAddress: 'test@example.com',
        password: 'password',
      };

      const existingUserMock: Partial<User> = {
        id: '1',
        emailAddress: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
      };

      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValue(existingUserMock as User);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(service['jwtService'], 'sign')
        .mockReturnValue('generatedAccessToken');

      const result = await service.loginUser(userLoginDto);

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { emailAddress: userLoginDto.emailAddress },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        userLoginDto.password,
        existingUserMock.password,
      );
      expect(service['jwtService'].sign).toHaveBeenCalledWith({
        sub: existingUserMock.id,
        username: existingUserMock.username,
      });
      expect(result).toEqual({ access_token: 'generatedAccessToken' });
    });

    it('should throw an error if a user with the provided credentials is not found', async () => {
      const userLoginDto: UserLoginDto = {
        emailAddress: 'test@example.com',
        password: 'password',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(service.loginUser(userLoginDto)).rejects.toThrow(Error);
    });

    it('should throw an UnauthorizedException if the provided password is invalid', async () => {
      const userLoginDto: UserLoginDto = {
        emailAddress: 'test@example.com',
        password: 'password',
      };

      const existingUserMock: Partial<User> = {
        id: '1',
        emailAddress: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
      };

      jest
        .spyOn(userModel, 'findOne')
        .mockResolvedValue(existingUserMock as User);

      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.loginUser(userLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an error if neither emailAddress nor username is provided', async () => {
      const userLoginDto: UserLoginDto = {
        password: 'password',
      };

      await expect(service.loginUser(userLoginDto)).rejects.toThrow(Error);
    });
  });

  describe('findOne', () => {
    it('should find a user by id and return the found user', async () => {
      const id = '1';
      const foundUser: Partial<User> = {
        id: '1',
        emailAddress: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
      };

      jest.spyOn(userModel, 'findOne').mockResolvedValue(foundUser as User);

      const result = await service.findOne(id);

      expect(userModel.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(result).toEqual(foundUser);
    });

    it('should throw an error if a user with the provided id is not found', async () => {
      const id = '1';

      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      jest
        .spyOn(userModel, 'findOne')
        .mockRejectedValue(new Error('User not found'));

      await expect(service.findOne(id)).rejects.toThrow(Error);
    });
  });

  describe('findAll', () => {
    it('should find all users and return the list of all users', async () => {
      const allUsers = [
        {
          id: '1',
          emailAddress: 'test1@example.com',
          username: 'testuser1',
          password: 'hashedPassword1',
          firstName: 'Test1',
          lastName: 'User1',
        },
        {
          id: '2',
          emailAddress: 'test2@example.com',
          username: 'testuser2',
          password: 'hashedPassword2',
          firstName: 'Test2',
          lastName: 'User2',
        },
      ];

      jest.spyOn(userModel, 'findAll').mockResolvedValue(allUsers as User[]);

      const result = await service.findAll();

      expect(userModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(allUsers);
    });

    it('should throw an error if failed to retrieve users', async () => {
      jest
        .spyOn(userModel, 'findAll')
        .mockRejectedValue(new Error('Failed to retrieve users'));

      await expect(service.findAll()).rejects.toThrow(Error);
    });
  });
});
