import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { UpdateMessageDto } from './dtos/update-message.dto';
import { Message } from '../database/schemas/message.model';
import { getModelToken } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: MessagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [
        MessagesService,
        {
          provide: getModelToken(Message),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
      imports: [JwtModule.register({ secret: 'your-secret-key' })],
    }).compile();

    controller = module.get<MessagesController>(MessagesController);
    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new message', async () => {
      const createMessageDto: CreateMessageDto = {
        userId: 'user-id',
        content: 'Test message',
        expiresIn: 3600,
      };

      const createdMessage: Partial<Message> = {
        id: 'message-id',
        expiresAt: new Date(new Date().getTime() + 3600 * 1000),
        content: 'Test message',
      };

      jest
        .spyOn(service, 'create')
        .mockResolvedValue(createdMessage as Message);

      const result = await controller.create(createMessageDto);

      expect(result).toEqual(createdMessage);
      expect(service.create).toHaveBeenCalledWith(createMessageDto);
    });
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const allMessages: Partial<Message>[] = [
        {
          id: 'message-id-1',
          expiresAt: new Date(new Date().getTime() + 3600 * 1000),
          content: 'Test message 1',
        },
        {
          id: 'message-id-2',
          expiresAt: new Date(new Date().getTime() + 3600 * 1000),
          content: 'Test message 2',
        },
      ];

      jest
        .spyOn(service, 'findAll')
        .mockResolvedValue(allMessages as Message[]);

      const result = await controller.findAll();

      expect(result).toEqual(allMessages);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a message by ID', async () => {
      const messageId = '123';
      const foundMessage: Partial<Message> = {
        id: messageId,
        expiresAt: new Date(new Date().getTime() + 3600 * 1000),
        content: 'Test message',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(foundMessage as Message);

      const result = await controller.findOne(messageId);

      expect(result).toEqual(foundMessage);
      expect(service.findOne).toHaveBeenCalledWith(messageId);
    });
  });

  describe('update', () => {
    it('should update a message by ID', async () => {
      const messageId = '123';
      const updateMessageDto: UpdateMessageDto = {
        content: 'Updated message',
        expiresIn: 3600,
      };

      const updatedMessage = {
        id: messageId,
        expiresAt: new Date(new Date().getTime() + 3600 * 1000),
        content: 'Updated message',
      };

      jest
        .spyOn(service, 'update')
        .mockResolvedValue(updatedMessage as Message);

      const result = await controller.update(messageId, updateMessageDto);

      expect(result).toEqual(updatedMessage);
      expect(service.update).toHaveBeenCalledWith(messageId, updateMessageDto);
    });
  });

  describe('remove', () => {
    it('should remove a message by ID', async () => {
      const messageId = '123';
      const removedMessage = {
        deleted: true,
      };

      jest.spyOn(service, 'remove').mockResolvedValue(removedMessage);

      const result = await controller.remove(messageId);

      expect(result).toEqual(removedMessage);
      expect(service.remove).toHaveBeenCalledWith(messageId);
    });
  });
});
