import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { MessagesService } from './messages.service';
import { UserAuthGuard } from '../users/users.guard';

/**
 * Controller for handling messages.
 */
@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessagesService) {}

  /**
   * Create a new message.
   * @param createMessageDto The data for creating the message.
   * @returns The created message.
   */
  @UseGuards(UserAuthGuard)
  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  /**
   * Get all messages.
   * @returns All messages.
   */
  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  /**
   * Get a message by ID.
   * @param id The ID of the message.
   * @returns The message with the specified ID.
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  /**
   * Update a message by ID.
   * @param id The ID of the message.
   * @param updateMessageDto The data for updating the message.
   * @returns The updated message.
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messageService.update(id, updateMessageDto);
  }

  /**
   * Remove a message by ID.
   * @param id The ID of the message.
   * @returns The removed message.
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
