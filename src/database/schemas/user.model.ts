import { Model, HasMany } from 'sequelize-typescript';
import { Table, Column, DataType } from 'sequelize-typescript';
import { Message } from './message.model';
import { Post } from './post.model';

/**
 * Represents a User in the database.
 */
@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  /**
   * The unique identifier of the user.
   */
  @Column({
    primaryKey: true,
    unique: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  /**
   * The username of the user.
   */
  @Column
  username: string;

  /**
   * The first name of the user.
   */
  @Column
  firstName: string;

  /**
   * The last name of the user.
   */
  @Column
  lastName: string;

  /**
   * The email address of the user.
   */
  @Column({
    unique: true,
  })
  emailAddress: string;

  /**
   * The password of the user.
   */
  @Column
  password: string;

  /**
   * The posts created by the user.
   */
  @HasMany(() => Post, {
    onDelete: 'CASCADE',
  })
  posts: Post[];

  /**
   * The messages sent by the user.
   */
  @HasMany(() => Message, {
    onDelete: 'CASCADE',
  })
  messages: Message[];

  /**
   * Converts the user model to a JSON object, excluding the password field.
   * @returns {Object} The JSON representation of the user model.
   */
  toJSON(): object {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
  }
}
