import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getModelToken } from '@nestjs/sequelize';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { InternalServerErrorException } from '@nestjs/common';
import { Post } from '../database/schemas/post.model';
import { JwtModule } from '@nestjs/jwt';
import { CreatePostDto } from './dtos/create-post.dto';
import { Image } from '../database/schemas/image.model';
import { User } from '../database/schemas/user.model';

describe('PostsService', () => {
  let service: PostsService;
  let postModelMock: any;
  let cloudinaryServiceMock: any;
  let imageModelMock: any;

  beforeEach(async () => {
    postModelMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      restore: jest.fn(),
      findByPk: jest.fn().mockResolvedValue({
        restore: jest.fn(),
      }),
    };

    cloudinaryServiceMock = {
      uploadImages: jest.fn(),
    };

    imageModelMock = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getModelToken(Post),
          useValue: postModelMock,
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

    service = module.get<PostsService>(PostsService);
  });

  describe('create', () => {
    it('should create a new post with images', async () => {
      const dto: CreatePostDto = {
        title: 'Test Post',
        body: 'This is a test post.',
        isPrivate: false,
        userId: 'user-id',
        metadata: {},
        tags: ['test', 'post'],
      };
      const files = {
        images: [
          {
            fieldname: 'images',
            originalname: 'image1.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 12345,
            buffer: Buffer.from('image1.jpg'),
            filename: 'image1.jpg',
            stream: null,
            destination: '/mock/destination',
            path: '/mock/path',
          },
          {
            fieldname: 'images',
            originalname: 'image2.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 23456,
            buffer: Buffer.from('image2.jpg'),
            filename: 'image2.jpg',
            stream: null,
            destination: '/mock/destination',
            path: '/mock/path',
          },
        ],
      };

      const createdPost = { id: '1', title: 'Test Post' };
      const createdImages = [
        { id: '1', url: 'image1.jpg', postId: '1' },
        { id: '2', url: 'image2.jpg', postId: '1' },
      ];
      const expectedPost = {
        id: '1',
        title: 'Test Post',
        images: createdImages,
      };

      postModelMock.create.mockResolvedValue(createdPost);
      cloudinaryServiceMock.uploadImages.mockResolvedValue(createdImages);
      imageModelMock.create.mockResolvedValue(null);
      service.findOne = jest.fn().mockResolvedValue(expectedPost);

      const result = await service.create(dto, files);

      expect(postModelMock.create).toHaveBeenCalledWith(dto);
      expect(cloudinaryServiceMock.uploadImages).toHaveBeenCalledWith(
        files.images,
      );
      expect(imageModelMock.create).toHaveBeenCalledTimes(2);
      expect(service.findOne).toHaveBeenCalledWith(createdPost.id, {
        include: [{ model: User }, { model: Image }],
      });
      expect(result).toEqual(expectedPost);
    });

    it('should create a new post without images', async () => {
      const dto: CreatePostDto = {
        title: 'Test Post',
        body: 'This is a test post.',
        isPrivate: false,
        userId: 'user-id',
        metadata: {},
        tags: ['test', 'post'],
      };
      const files = {};
      const createdPost = { id: '1', title: 'Test Post' };
      const expectedPost = { id: '1', title: 'Test Post', images: [] };

      postModelMock.create.mockResolvedValue(createdPost);
      service.findOne = jest.fn().mockResolvedValue(expectedPost);

      const result = await service.create(dto, files);

      expect(postModelMock.create).toHaveBeenCalledWith(dto);
      expect(cloudinaryServiceMock.uploadImages).not.toHaveBeenCalled();
      expect(imageModelMock.create).not.toHaveBeenCalled();
      expect(service.findOne).toHaveBeenCalledWith(createdPost.id, {
        include: [{ model: User }, { model: Image }],
      });
      expect(result).toEqual(expectedPost);
    });

    it('should throw InternalServerErrorException if failed to create the post', async () => {
      const dto: CreatePostDto = {
        title: 'Test Post',
        body: 'This is a test post.',
        isPrivate: false,
        userId: 'user-id',
        metadata: {},
        tags: ['test', 'post'],
      };
      const files = {
        images: [
          {
            fieldname: 'images',
            originalname: 'image1.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 12345,
            buffer: Buffer.from('image1.jpg'),
            filename: 'image1.jpg',
            stream: null,
            destination: '/mock/destination',
            path: '/mock/path',
          },
          {
            fieldname: 'images',
            originalname: 'image2.jpg',
            encoding: '7bit',
            mimetype: 'image/jpeg',
            size: 23456,
            buffer: Buffer.from('image2.jpg'),
            filename: 'image2.jpg',
            stream: null,
            destination: '/mock/destination',
            path: '/mock/path',
          },
        ],
      };

      postModelMock.create.mockRejectedValue(new Error());

      await expect(service.create(dto, files)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should retrieve all posts', async () => {
      const posts = [
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' },
      ];

      postModelMock.findAll.mockResolvedValue(posts);

      const result = await service.findAll();

      expect(postModelMock.findAll).toHaveBeenCalledWith({
        where: { isPrivate: false },
        include: [{ model: Image }, { model: User }],
      });
      expect(result).toEqual(posts);
    });

    it('should throw InternalServerErrorException if failed to retrieve the posts', async () => {
      postModelMock.findAll.mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllByUser', () => {
    it('should retrieve all posts by user', async () => {
      const userId = '1';
      const posts = [
        { id: '1', title: 'Post 1' },
        { id: '2', title: 'Post 2' },
      ];

      postModelMock.findAll.mockResolvedValue(posts);

      const result = await service.findAllByUser(userId);

      expect(postModelMock.findAll).toHaveBeenCalledWith({
        where: { userId },
        include: [{ model: Image }, { model: User }],
      });
      expect(result).toEqual(posts);
    });

    it('should throw InternalServerErrorException if failed to retrieve the posts', async () => {
      const userId = '1';

      postModelMock.findAll.mockRejectedValue(new Error());

      await expect(service.findAllByUser(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should retrieve a post by its ID', async () => {
      const id = '1';
      const user = { id: '1' };
      const post = { id: '1', title: 'Test Post' };

      postModelMock.findOne.mockResolvedValue(post);

      const result = await service.findOne(id, user);

      expect(postModelMock.findOne).toHaveBeenCalledWith({
        where: { id },
        include: [{ model: Image }, { model: User }],
      });
      expect(result).toEqual(post);
    });

    it('should throw NotFoundException if the post with the specified ID is not found', async () => {
      const id = '1';
      const user = { id: '1' };

      postModelMock.findOne.mockResolvedValue(null);

      await expect(service.findOne(id, user)).rejects.toThrow(Error);
    });

    it('should throw InternalServerErrorException if failed to find the post', async () => {
      const id = '1';
      const user = { id: '1' };

      postModelMock.findOne.mockRejectedValue(new Error());

      await expect(service.findOne(id, user)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a post by its ID', async () => {
      const id = '1';
      const dto = { title: 'Updated Post' };
      const updatedPost = { id: '1', title: 'Updated Post' };

      postModelMock.update.mockResolvedValue([1]);
      service.findOne = jest.fn().mockResolvedValue(updatedPost);

      const result = await service.update(id, dto);

      expect(postModelMock.update).toHaveBeenCalledWith(dto, { where: { id } });
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException if the post with the specified ID is not found', async () => {
      const id = '1';
      const dto = { title: 'Updated Post' };

      postModelMock.update.mockResolvedValue([0]);

      await expect(service.update(id, dto)).rejects.toThrow(Error);
    });

    it('should throw InternalServerErrorException if failed to update the post', async () => {
      const id = '1';
      const dto = { title: 'Updated Post' };

      postModelMock.update.mockRejectedValue(new Error());

      await expect(service.update(id, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a post by its ID', async () => {
      const id = '1';

      postModelMock.destroy.mockResolvedValue(1);

      const result = await service.remove(id);

      expect(postModelMock.destroy).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if the post with the specified ID is not found', async () => {
      const id = '1';

      postModelMock.destroy.mockResolvedValue(0);

      await expect(service.remove(id)).rejects.toThrow(Error);
    });

    it('should throw InternalServerErrorException if failed to remove the post', async () => {
      const id = '1';

      postModelMock.destroy.mockRejectedValue(new Error());

      await expect(service.remove(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('restore', () => {
    it('should throw NotFoundException if the post with the specified ID is not found', async () => {
      const id = '1';

      postModelMock.findByPk.mockResolvedValue(null);

      await expect(service.restore(id)).rejects.toThrow(Error);
    });

    it('should throw InternalServerErrorException if failed to restore the post', async () => {
      const id = '1';

      postModelMock.findByPk.mockResolvedValue({
        id: '1',
        title: 'Deleted Post',
      });
      postModelMock.restore.mockRejectedValue(new Error());

      await expect(service.restore(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if the post was deleted more than 24 hours ago', async () => {
      const id = '1';
      const now = new Date();
      const twentyFourHoursAgo = new Date(
        now.getTime() - 24 * 60 * 60 * 1000 - 1,
      );

      postModelMock.findByPk.mockResolvedValue({
        id: '1',
        title: 'Deleted Post',
        deletedAt: twentyFourHoursAgo,
      });

      await expect(service.restore(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updatePrivateStatus', () => {
    it('should update the private status of a post by its ID', async () => {
      const id = '1';
      const isPrivate = true;
      const updatedPost = { id: '1', title: 'Test Post', isPrivate: true };

      postModelMock.update.mockResolvedValue([1]);
      service.findOne = jest.fn().mockResolvedValue(updatedPost);

      const result = await service.updatePrivateStatus(id, isPrivate);

      expect(postModelMock.update).toHaveBeenCalledWith(
        { isPrivate },
        { where: { id } },
      );
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(updatedPost);
    });

    it('should throw NotFoundException if the post with the specified ID is not found', async () => {
      const id = '1';
      const isPrivate = true;

      postModelMock.update.mockResolvedValue([0]);

      await expect(service.updatePrivateStatus(id, isPrivate)).rejects.toThrow(
        Error,
      );
    });

    it('should throw InternalServerErrorException if failed to update the post', async () => {
      const id = '1';
      const isPrivate = true;

      postModelMock.update.mockRejectedValue(new Error());

      await expect(service.updatePrivateStatus(id, isPrivate)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
