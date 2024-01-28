import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRegistrationDto } from './dtos/user-registration.dto';
import { UserLoginDto } from './dtos/user-login.dto';
import { User } from '../database/schemas/user.model';
import { JwtModule } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
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

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('registration', () => {
    it('should register a user and return the created user', async () => {
      const userRegistrationDto: UserRegistrationDto = {
        emailAddress: 'test@example.com',
        username: 'testuser',
        password: 'plainPassword',
        firstName: 'Test',
        lastName: 'User',
      };

      const mockUser: Partial<User> = {
        id: 'a-unique-uuid',
        emailAddress: 'test@example.com',
        username: 'testuser',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
      };

      jest
        .spyOn(usersService, 'createUser')
        .mockResolvedValue(mockUser as User);

      // Call the registration method on the controller
      const result = await controller.registration(userRegistrationDto);

      const expectedResult = {
        ...userRegistrationDto,
        id: 'a-unique-uuid',
        password: 'hashedPassword',
      };

      expect(result).toEqual(expectedResult);
      expect(usersService.createUser).toHaveBeenCalledWith(userRegistrationDto);
    });
  });

  describe('login', () => {
    it('should log in a user and return the access token', async () => {
      const userLoginDto: UserLoginDto = {
        emailAddress: 'test@example.com',
        password: 'password',
      };
      const loginResponse = { access_token: 'generatedAccessToken' };

      jest.spyOn(usersService, 'loginUser').mockResolvedValue(loginResponse);

      const result = await controller.login(userLoginDto);

      expect(usersService.loginUser).toHaveBeenCalledWith(userLoginDto);
      expect(result).toEqual(loginResponse);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const allUsers = [
        { id: '1', emailAddress: 'user1@example.com', username: 'user1' },
        { id: '2', emailAddress: 'user2@example.com', username: 'user2' },
      ];

      jest.spyOn(usersService, 'findAll').mockResolvedValue(allUsers as User[]);

      const result = await controller.getAllUsers();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(allUsers);
    });
  });

  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const user = {
        id: '1',
        emailAddress: 'test@example.com',
        username: 'testuser',
      };

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user as User);

      const result = await controller.getUserById('1');

      expect(usersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(user);
    });
  });
});
