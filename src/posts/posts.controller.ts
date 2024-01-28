import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { UpdatePostDto } from './dtos/update-post.dto';
import { PostsService } from './posts.service';
import { UserAuthGuard } from '../users/users.guard';
import { UpdatePostPrivacyDto } from './dtos/update-post-privacy.dto';
import { OptionalAuth } from '../utilities/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

/**
 * Controller for managing posts.
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * Create a new post.
   * @param dto - The data for creating the post.
   * @returns The created post.
   */
  @UseGuards(UserAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'images', maxCount: 4 }]))
  create(
    @UploadedFiles() files: { images?: Express.Multer.File[] },
    @Body()
    createPostDto: CreatePostDto,
  ) {
    return this.postsService.create(createPostDto, files);
  }

  /**
   * Get all posts.
   * @returns All posts.
   */
  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  /**
   * Get all posts by a user.
   * @param request - The HTTP request object.
   * @returns All posts by the user.
   */
  @UseGuards(UserAuthGuard)
  @Get('user')
  findByUser(@Request() request) {
    return this.postsService.findAllByUser(request.user.sub);
  }

  /**
   * Get a post by ID.
   * @param id - The ID of the post.
   * @returns The post with the specified ID.
   */
  @UseGuards(UserAuthGuard)
  @OptionalAuth()
  @Get(':id')
  findOne(@Param('id') id: string, @Request() request) {
    let user = null;
    if (request.user) {
      user = request.user;
    }
    return this.postsService.findOne(id, user);
  }

  /**
   * Update a post.
   * @param id - The ID of the post to update.
   * @param dto - The updated data for the post.
   * @returns The updated post.
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(id, dto);
  }

  /**
   * Remove a post.
   * @param id - The ID of the post to remove.
   * @returns The removed post.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }

  /**
   * Restore a post.
   * @param id - The ID of the post to restore.
   * @returns The restored post.
   * */
  @UseGuards(UserAuthGuard)
  @Put(':id/restore')
  restore(@Param('id') id: string) {
    return this.postsService.restore(id);
  }

  /**
   * Update the private status of a post.
   * @param id - The ID of the post to update.
   * @returns The updated post.
   */
  @UseGuards(UserAuthGuard)
  @Put(':id/private')
  updatePrivate(@Param('id') id: string, @Body() dto: UpdatePostPrivacyDto) {
    return this.postsService.updatePrivateStatus(id, dto.isPrivate);
  }
}
