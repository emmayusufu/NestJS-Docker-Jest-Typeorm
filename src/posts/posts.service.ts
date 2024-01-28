import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Post } from '../database/schemas/post.model';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Image } from '../database/schemas/image.model';
import { User } from '../database/schemas/user.model';

/**
 * Service responsible for handling CRUD operations for posts.
 */
@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post)
    private postModel: typeof Post,
    private cloudinaryService: CloudinaryService,
    @InjectModel(Image)
    private imageModel: typeof Image,
  ) {}

  /**
   * Creates a new post.
   * @param dto - The data for creating the post.
   * @returns The created post.
   * @throws InternalServerErrorException if failed to create the post.
   */
  async create(dto: CreatePostDto, files: { images?: Express.Multer.File[] }) {
    try {
      const record = await this.postModel.create(dto);

      if (files.images && files.images.length > 0) {
        const images = await this.cloudinaryService.uploadImages(files.images);

        const imageUrls = images.map((image) => image.secure_url);

        await Promise.all(
          imageUrls.map((url) =>
            this.imageModel.create({
              url: url,
              postId: record.id,
            }),
          ),
        );
      }

      const post = await this.findOne(record.id, {
        include: [
          {
            model: User,
          },
          {
            model: Image,
          },
        ],
      });

      return post;
    } catch (error) {
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  /**
   * Retrieves all posts.
   * @returns An array of posts.
   * @throws InternalServerErrorException if failed to retrieve the posts.
   */
  async findAll() {
    try {
      return await this.postModel.findAll({
        where: {
          isPrivate: false,
        },
        include: [
          {
            model: Image,
          },
          {
            model: User,
          },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }

  /**
   * Retrieves all of a user's posts.
   * @param userId - The ID of the user.
   * @returns An array of posts.
   * @throws InternalServerErrorException if failed to retrieve the posts.
   */
  async findAllByUser(userId: string) {
    try {
      return await this.postModel.findAll({
        where: {
          userId,
        },
        include: [
          {
            model: Image,
          },
          {
            model: User,
          },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve posts');
    }
  }
  /**
   * Retrieves a post by its ID.
   * @param id - The ID of the post.
   * @returns The found post.
   * @throws NotFoundException if the post with the specified ID is not found.
   * @throws InternalServerErrorException if failed to find the post.
   */
  async findOne(id: string, user?: any) {
    const filters = {
      isPrivate: false,
      id,
    };

    if (user) {
      delete filters['isPrivate'];
    }

    try {
      const post = await this.postModel.findOne({
        where: filters,
        include: [
          {
            model: Image,
          },
          {
            model: User,
          },
        ],
      });
      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return post;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find post with ID ${id}`,
      );
    }
  }

  /**
   * Updates a post by its ID.
   * @param id - The ID of the post.
   * @param dto - The data for updating the post.
   * @returns The updated post.
   * @throws NotFoundException if the post with the specified ID is not found.
   * @throws InternalServerErrorException if failed to update the post.
   */
  async update(id: string, dto: UpdatePostDto) {
    try {
      const [numberOfAffectedRows] = await this.postModel.update(dto, {
        where: { id },
      });
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update post with ID ${id}`,
      );
    }
  }

  /**
   * Removes a post by its ID.
   * @param id - The ID of the post.
   * @returns An object indicating whether the post was deleted successfully.
   * @throws NotFoundException if the post with the specified ID is not found.
   * @throws InternalServerErrorException if failed to remove the post.
   */
  async remove(id: string) {
    try {
      const deleted = await this.postModel.destroy({ where: { id } });
      if (deleted === 0) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return { deleted: true };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to remove post with ID ${id}`,
      );
    }
  }

  /**
   * Restores a deleted post
   * @param id - The ID of the post.
   * @returns The restored post.
   * @throws NotFoundException if the post with the specified ID is not found.
   * @throws InternalServerErrorException if failed to restore the post.
   * */
  async restore(id: string) {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const record = await this.postModel.findByPk(id, {
        paranoid: false,
      });

      // If the record was deleted more than 24 hours ago, it cannot be restored.
      if (record.deletedAt < twentyFourHoursAgo) {
        throw new InternalServerErrorException(
          `Cannot restore post with ID ${id} because it was deleted more than 24 hours ago`,
        );
      }

      await record.restore();

      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to restore post with ID ${error}`,
      );
    }
  }

  /**
   * Updates the private status of a post by its ID.
   * @param id - The ID of the post.
   * @param isPrivate - The new private status of the post.
   * @returns The updated post.
   * @throws NotFoundException if the post with the specified ID is not found.
   * @throws InternalServerErrorException if failed to update the post.
   */
  async updatePrivateStatus(id: string, isPrivate: boolean) {
    try {
      const [numberOfAffectedRows] = await this.postModel.update(
        { isPrivate },
        {
          where: { id },
        },
      );
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update post with ID ${id}`,
      );
    }
  }
}
