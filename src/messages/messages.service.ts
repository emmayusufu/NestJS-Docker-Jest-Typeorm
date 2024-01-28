import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Message } from '../database/schemas/message.model';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { Op } from 'sequelize';
import { User } from '../database/schemas/user.model';

/**
 * Service responsible for handling messages.
 */
@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message)
    private messageModel: typeof Message,
  ) {}

  /**
   * Creates a new message.
   * @param dto - The data to create the message.
   * @returns The created message.
   * @throws InternalServerErrorException if failed to create the message.
   */
  async create(dto: CreateMessageDto) {
    try {
      let expiresAt = null;

      if (dto.expiresIn) {
        expiresAt = new Date(new Date().getTime() + dto.expiresIn * 1000);
      }

      return await this.messageModel.create({
        content: dto.content,
        expiresAt,
        userId: dto.userId,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to create message');
    }
  }

  /**
   * Retrieves all messages.
   * @returns An array of messages.
   * @throws InternalServerErrorException if failed to retrieve the messages.
   */
  async findAll() {
    try {
      const now = new Date();

      return await this.messageModel.findAll({
        where: {
          [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: now } }],
        },
        include: [
          {
            model: User,
          },
        ],
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve messages');
    }
  }

  /**
   * Retrieves a message by its ID.
   * @param id - The ID of the message to retrieve.
   * @returns The retrieved message.
   * @throws NotFoundException if the message with the specified ID is not found.
   * @throws InternalServerErrorException if failed to find the message.
   */
  async findOne(id: string) {
    try {
      const message = await this.messageModel.findOne({
        where: { id },
        include: [
          {
            model: User,
          },
        ],
      });
      if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }
      return message;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to find message with ID ${id}`,
      );
    }
  }

  /**
   * Updates a message by its ID.
   * @param id - The ID of the message to update.
   * @param dto - The data to update the message.
   * @returns The updated message.
   * @throws NotFoundException if the message with the specified ID is not found.
   * @throws InternalServerErrorException if failed to update the message.
   */
  async update(id: string, dto: UpdateMessageDto) {
    try {
      let expiresAt = null;

      if (dto.expiresIn) {
        expiresAt = new Date(new Date().getTime() + dto.expiresIn * 1000);
      }

      const updateMessageDto = {
        content: dto.content,
        expiresAt,
        userId: dto.userId,
      };

      const [numberOfAffectedRows] = await this.messageModel.update(
        updateMessageDto,
        {
          where: { id },
        },
      );
      if (numberOfAffectedRows === 0) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update message with ID ${id}`,
      );
    }
  }

  /**
   * Removes a message by its ID.
   * @param id - The ID of the message to remove.
   * @returns An object indicating whether the message was deleted successfully.
   * @throws NotFoundException if the message with the specified ID is not found.
   * @throws InternalServerErrorException if failed to remove the message.
   */
  async remove(id: string) {
    try {
      const message = await this.findOne(id);

      if (!message) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }

      const deleted = await this.messageModel.destroy({ where: { id } });
      if (deleted === 0) {
        throw new NotFoundException(`Message with ID ${id} not found`);
      }
      return { deleted: true };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to remove message with ID ${id}`,
      );
    }
  }
}
