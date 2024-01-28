import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Image } from './image.model';

/**
 * Represents a post in the database.
 */
@Table({
  tableName: 'posts',
  timestamps: true,
  paranoid: true,
})
export class Post extends Model<Post> {
  /**
   * The unique identifier of the post.
   */
  @Column({
    primaryKey: true,
    unique: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  /**
   * The title of the post.
   */
  @Column
  title: string;

  /**
   * The body content of the post.
   */
  @Column(DataType.TEXT)
  body: string;

  /**
   * Indicates whether the post is private or not.
   */
  @Column
  isPrivate: boolean;

  /**
   * Additional metadata associated with the post.
   */
  @Column(DataType.JSON)
  metadata: any;

  /**
   * The tags associated with the post.
   */
  @Column(DataType.ARRAY(DataType.STRING))
  tags: string[];

  /**
   * The date and time when the post was deleted.
   */
  @Column
  deletedAt: Date;

  /**
   * The foreign key referencing the user who created the post.
   */
  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
  })
  userId: string;

  /**
   * The user who created the post.
   */
  @BelongsTo(() => User)
  user: User;

  /**
   * The images associated with the post.
   */
  @HasMany(() => Image, {
    onDelete: 'CASCADE',
  })
  images: Image[];
}
