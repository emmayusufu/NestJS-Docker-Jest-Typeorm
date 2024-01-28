import { Test, TestingModule } from '@nestjs/testing';
import { MessagesService } from './messages.service';
import { getModelToken } from '@nestjs/sequelize';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { Message } from '../database/schemas/message.model';
import { JwtModule } from '@nestjs/jwt';

describe('MessagesService', () => {
  let service: MessagesService;
  let messageModel: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: getModelToken(Message),
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
          },
        },
      ],
      imports: [JwtModule.register({ secret: 'your-secret-key' })],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
    messageModel = module.get(getModelToken(Message));
  });

  describe('create', () => {
    it('should create a new message', async () => {
      const dto: CreateMessageDto = {
        content: 'Test message',
        expiresIn: 3600,
        userId: 'user-id',
      };
      const createdMessage = {
        id: 'message-id',
        userId: 'user-id',
        content: 'Test message',
        expiresAt: new Date(new Date().getTime() + 3600 * 1000),
      };

      messageModel.create.mockResolvedValue(createdMessage);

      const result = await service.create(dto);

      expect(messageModel.create).toHaveBeenCalledWith({
        content: 'Test message',
        expiresAt: expect.any(Date),
        userId: 'user-id',
      });

      expect(result).toEqual(createdMessage);
    });

    it('should throw InternalServerErrorException if failed to create the message', async () => {
      const dto: CreateMessageDto = {
        content: 'Test message',
        expiresIn: 3600,
        userId: 'user-id',
      };
      messageModel.create.mockRejectedValue(new Error());

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll', () => {
    it('should retrieve all messages', async () => {
      const messages = [{ id: 'message-id', content: 'Test message' }];
      messageModel.findAll.mockResolvedValue(messages);

      const result = await service.findAll();

      expect(messageModel.findAll).toHaveBeenCalled();
      expect(result).toEqual(messages);
    });

    it('should throw InternalServerErrorException if failed to retrieve the messages', async () => {
      messageModel.findAll.mockRejectedValue(new Error());

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should retrieve a message by its ID', async () => {
      const id = 'message-id';
      const message = { id, content: 'Test message' };

      messageModel.findOne.mockResolvedValue(message);

      const result = await service.findOne(id);

      expect(messageModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id } }),
      );
      expect(result).toEqual(message);
    });

    it('should throw NotFoundException if the message with the specified ID is not found', async () => {
      const id = '1';

      jest.spyOn(messageModel, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(Error);
    });

    it('should throw InternalServerErrorException if failed to find the message', async () => {
      const id = 'message-id';
      messageModel.findOne.mockRejectedValue(new Error());

      await expect(service.findOne(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update a message by its ID', async () => {
      const id = 'message-id';
      const dto: UpdateMessageDto = {
        content: 'Updated message',
        expiresIn: 7200,
        userId: 'user-id',
      };
      const updatedMessage = {
        id,
        userId: 'user-id',
        expiresAt: new Date(new Date().getTime() + 7200 * 1000),
        content: 'Updated message',
      };

      messageModel.update.mockResolvedValue([1]);
      messageModel.findOne.mockResolvedValue(updatedMessage);

      const result = await service.update(id, dto);

      expect(messageModel.update).toHaveBeenCalledWith(
        {
          content: 'Updated message',
          expiresAt: expect.any(Date),
          userId: 'user-id',
        },
        { where: { id } },
      );
      expect(messageModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id } }),
      );
      expect(result).toEqual(updatedMessage);
    });

    it('should throw NotFoundException if the message with the specified ID is not found', async () => {
      const id = 'non-existent-id';
      const dto: UpdateMessageDto = {
        content: 'Updated message',
        expiresIn: 7200,
        userId: 'user-id',
      };
      messageModel.update.mockResolvedValue([0]);

      await expect(service.update(id, dto)).rejects.toThrow(Error);
    });

    it('should throw InternalServerErrorException if failed to update the message', async () => {
      const id = 'message-id';
      const dto: UpdateMessageDto = {
        content: 'Updated message',
        expiresIn: 7200,
        userId: 'user-id',
      };
      messageModel.update.mockRejectedValue(new Error());

      await expect(service.update(id, dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a message by its ID', async () => {
      const id = 'message-id';

      messageModel.findOne.mockResolvedValue({
        id: 'message-id',
        content: 'Test message',
      });

      messageModel.destroy.mockResolvedValue(1);

      const result = await service.remove(id);

      expect(messageModel.destroy).toHaveBeenCalledWith({ where: { id } });
      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if the message with the specified ID is not found', async () => {
      const id = 'non-existent-id';
      messageModel.destroy.mockResolvedValue(0);

      await expect(service.remove(id)).rejects.toThrow(Error);
    });

    it('should throw InternalServerErrorException if failed to remove the message', async () => {
      const id = 'message-id';
      messageModel.destroy.mockRejectedValue(new Error());

      await expect(service.remove(id)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
