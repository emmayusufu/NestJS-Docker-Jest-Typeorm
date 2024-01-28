import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Post } from './post.model';

/**
 * Represents an image in the database.
 */
@Table({
  tableName: 'images',
  timestamps: true,
})
export class Image extends Model<Image> {
  /**
   * The unique identifier of the image.
   */
  @Column({
    primaryKey: true,
    unique: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  /**
   * The URL of the image.
   */
  @Column
  url: string;

  /**
   * The foreign key referencing the associated post.
   */
  @ForeignKey(() => Post)
  @Column({
    type: DataType.UUID,
  })
  postId: string;

  /**
   * The associated post.
   */
  @BelongsTo(() => Post)
  post: Post;
}
