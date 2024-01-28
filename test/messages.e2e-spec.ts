import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

import { AppModule } from '../src/app.module';
import { UserRegistrationDto } from '../src/users/dtos/user-registration.dto';

describe('MessagesController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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

  afterAll(async () => {
    await app.close();
  });

  it('/users/registration (POST)', async () => {
    const userRegistrationDto: UserRegistrationDto = userDto;

    const response = await request(app.getHttpServer())
      .post('/users/registration')
      .send(userRegistrationDto)
      .expect(HttpStatus.CREATED);

    expect(response.body).toHaveProperty('username', userDto.username);
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

    authToken = response.body.access_token;

    expect(response.body).toHaveProperty('access_token');
  });

  it('POST /messages', async () => {
    const createMessageDto = {
      content: 'Test message',
      userId: '1',
      expiresIn: 3600,
    };

    return request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${authToken}`)
      .send(createMessageDto)
      .expect(HttpStatus.CREATED)
      .then((response) => {
        expect(response.body).toEqual({
          id: expect.any(String),
          content: createMessageDto.content,
          userId: createMessageDto.userId,
          expiresAt: expect.any(String),
        });
      });
  });

  it('GET /messages', () => {
    return request(app.getHttpServer())
      .get('/messages')
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        // Additional assertions as needed
      });
  });

  it('PUT /messages/:id', async () => {
    const updateMessageDto = {
      content: 'Updated message',
      expiresIn: 7200, // Optional
    };
    const messageId = '1'; // Use an existing message ID

    return request(app.getHttpServer())
      .put(`/messages/${messageId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updateMessageDto)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body.content).toEqual(updateMessageDto.content);
      });
  });

  it('DELETE /messages/:id', () => {
    const messageId = '1'; // Use an existing message ID

    return request(app.getHttpServer())
      .delete(`/messages/${messageId}`)
      .expect(HttpStatus.OK)
      .then((response) => {
        expect(response.body.deleted).toEqual(true);
      });
  });
});
