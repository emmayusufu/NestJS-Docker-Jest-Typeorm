import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { Post } from '../database/schemas/post.model';
import { getModelToken } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Image } from '../database/schemas/image.model';

describe('PostsController', () => {
  let controller: PostsController;
  let service: PostsService;
  let cloudinaryServiceMock: any;
  let imageModelMock: any;

  beforeEach(async () => {
    cloudinaryServiceMock = {
      uploadImages: jest.fn(),
    };

    imageModelMock = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        PostsService,
        {
          provide: getModelToken(Post),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: CloudinaryService,
          useValue: cloudinaryServiceMock,
        },
        {
          provide: getModelToken(Image),
          useValue: imageModelMock,
        },
      ],
      imports: [JwtModule.register({ secret: 'your-secret-key' })],
    }).compile();

    controller = module.get<PostsController>(PostsController);
    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        title: 'Test post',
        body: 'This is a test post.',
        metadata: {
          tags: ['test', 'post'],
        },
        tags: ['test', 'post'],
        isPrivate: false,
        userId: 'user-id',
      };
      const files = {
        images: [
          /* image files */
        ],
      };
      const createdPost: Partial<Post> = {
        id: 'post-id',
        ...createPostDto,
      };
      jest.spyOn(service, 'create').mockResolvedValue(createdPost as Post);

      const result = await controller.create(files, createPostDto);

      expect(result).toBe(createdPost);
      expect(service.create).toHaveBeenCalledWith(createPostDto, files);
    });
  });

  describe('findAll', () => {
    it('should get all posts', async () => {
      const allPosts: Partial<Post>[] = [
        {
          title: 'Test post 1',
          body: 'This is a test post 1.',
          userId: 'user-id',
          tags: ['test', 'post'],
          metadata: {},
          isPrivate: false,
        },
        {
          title: 'Test post 2',
          body: 'This is a test post 2.',
          userId: 'user-id',
          tags: ['test', 'post'],
          metadata: {},
          isPrivate: false,
        },
      ];
      jest.spyOn(service, 'findAll').mockResolvedValue(allPosts as Post[]);

      const result = await controller.findAll();

      expect(result).toEqual(allPosts);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should get all posts by a user', async () => {
      const request = { user: { sub: 'user-id' } };
      const userPosts = [
        {
          title: 'Test post 1',
          body: 'This is a test post 1.',
          userId: 'user-id',
          tags: ['test', 'post'],
          metadata: {},
          isPrivate: false,
        },
        {
          title: 'Test post 2',
          body: 'This is a test post 2.',
          userId: 'user-id',
          tags: ['test', 'post'],
          metadata: {},
          isPrivate: false,
        },
      ];
      jest
        .spyOn(service, 'findAllByUser')
        .mockResolvedValue(userPosts as Post[]);

      const result = await controller.findByUser(request);

      expect(result).toBe(userPosts);
      expect(service.findAllByUser).toHaveBeenCalledWith(request.user.sub);
    });
  });

  describe('findOne', () => {
    it('should get a post by ID', async () => {
      const id = 'post-id';
      const request = { user: { sub: 'user-id' } };
      const post = {
        title: 'Test post',
        body: 'This is a test post.',
        userId: 'user-id',
        tags: ['test', 'post'],
        metadata: {},
        isPrivate: false,
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(post as Post);

      const result = await controller.findOne(id, request);

      expect(result).toBe(post);
      expect(service.findOne).toHaveBeenCalledWith(id, request.user);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const id = 'post-id';
      const updatePostDto = {
        title: 'Test post',
        body: 'This is a test post.',
        metadata: {
          tags: ['test', 'post'],
        },
        tags: ['test', 'post'],
        isPrivate: false,
        userId: 'user-id',
      };
      const updatedPost = {
        ...updatePostDto,
      };
      jest.spyOn(service, 'update').mockResolvedValue(updatedPost as Post);

      const result = await controller.update(id, updatePostDto);

      expect(result).toBe(updatedPost);
      expect(service.update).toHaveBeenCalledWith(id, updatePostDto);
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const id = 'post-id';

      jest.spyOn(service, 'remove').mockResolvedValue({
        deleted: true,
      });

      const result = await controller.remove(id);

      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });

  describe('updatePrivate', () => {
    it('should update the private status of a post', async () => {
      const id = 'post-id';
      const updatePostPrivacyDto = { isPrivate: true };
      const updatedPost: Partial<Post> = {
        id: 'post-id',
        title: 'Test post',
        body: 'This is a test post.',
        userId: 'user-id',
        tags: ['test', 'post'],
        metadata: {},
        isPrivate: true,
      };
      jest
        .spyOn(service, 'updatePrivateStatus')
        .mockResolvedValue(updatedPost as Post);

      const result = await controller.updatePrivate(id, updatePostPrivacyDto);

      expect(result).toBe(updatedPost);
      expect(service.updatePrivateStatus).toHaveBeenCalledWith(
        id,
        updatePostPrivacyDto.isPrivate,
      );
    });
  });
});
