import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { faker } from '@faker-js/faker';

import { AppModule } from '../src/app.module';
import { CreatePostDto } from '../src/posts/dtos/create-post.dto';
import { Post } from '../src/database/schemas/post.model';
import { UserRegistrationDto } from '../src/users/dtos/user-registration.dto';
import { User } from '../src/database/schemas/user.model';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let post: Post;

  let user: User;

  const userDto: UserRegistrationDto = {
    username: faker.internet.userName(),
    emailAddress: faker.internet.email(),
    password: faker.internet.password() + faker.internet.password(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
  };

  const createPostDto: CreatePostDto = {
    title: faker.lorem.sentence(),
    body: faker.lorem.paragraphs(),
    tags: faker.lorem.words().split(' '),
    userId: 'random',
    isPrivate: faker.datatype.boolean(),
    metadata: {
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    },
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

  it('/users/credentials (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/credentials')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    user = response.body;
  });

  it('/posts (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .field('title', createPostDto.title)
      .field('content', createPostDto.body)
      .field('userId', user.id)
      .expect(HttpStatus.CREATED);

    post = response.body;
    expect(post).toHaveProperty('id');
    expect(post.title).toEqual(createPostDto.title);
  });

  it('/posts (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/posts')
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/posts/user (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/posts/user')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/posts/:id (GET)', async () => {
    const postId = post.id;
    const response = await request(app.getHttpServer())
      .get(`/posts/${postId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);

    expect(response.body.id).toEqual(postId);
  });

  //   it('/posts/:id (PUT)', async () => {
  //     const updatePostDto: UpdatePostDto = {
  //       title: 'Updated Title',
  //       body: 'Updated content',
  //       userId: user.id,
  //     };
  //     const postId = post.id;

  //     const response = await request(app.getHttpServer())
  //       .put(`/posts/${postId}`)
  //       .set('Authorization', `Bearer ${authToken}`)
  //       .send(updatePostDto)
  //       .expect(HttpStatus.OK);

  //     expect(response.body.title).toEqual(updatePostDto.title);
  //   });

  it('/posts/:id (DELETE)', async () => {
    const postId = post.id;
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK);
  });
});
