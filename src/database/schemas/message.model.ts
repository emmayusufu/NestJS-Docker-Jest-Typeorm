import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

/**
 * Represents a message in the database.
 */
@Table({
  tableName: 'messages',
  timestamps: true,
})
export class Message extends Model<Message> {
  /**
   * The unique identifier of the message.
   */
  @Column({
    primaryKey: true,
    unique: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  /**
   * The content of the message.
   */
  @Column(DataType.TEXT)
  content: string;

  /**
   * The expiration date of the message.
   */
  @Column
  expiresAt: Date;

  /**
   * The foreign key referencing the user who sent the message.
   */
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId: string;

  /**
   * The user who sent the message.
   */
  @BelongsTo(() => User)
  user: User;
}
