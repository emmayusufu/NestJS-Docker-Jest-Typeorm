import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { UserRegistrationDto } from '../src/users/dtos/user-registration.dto';
import { AppModule } from '../src/app.module';
import { faker } from '@faker-js/faker';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const userDto: UserRegistrationDto = {
    username: faker.internet.userName(),
    emailAddress: faker.internet.email(),
    password: faker.internet.password() + faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/users/registration (POST)', async () => {
    const userRegistrationDto: UserRegistrationDto = userDto;

    const response = await request(app.getHttpServer())
      .post('/users/registration')
      .send(userRegistrationDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty(
      'username',
      userRegistrationDto.username,
    );
  });

  it('/users/login (POST)', async () => {
    const userLoginDto = {
      username: userDto.username,
      password: userDto.password,
    };

    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send(userLoginDto)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('access_token');
  });

  it('/users/ (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/users/:id (GET)', async () => {
    const users = await request(app.getHttpServer())
      .get('/users')
      .expect(HttpStatus.OK);

    const userId = users.body[0].id;

    const response = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(HttpStatus.OK);

    expect(response.body).toHaveProperty('id', userId);
  });
});
