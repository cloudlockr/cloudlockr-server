/**
 * This module contains the entity/model File, which is the interface FileDTO.
 * FileDTO contains all the requisite fields that represents the File entity.
 * In the Clean Architecture, FileDTO is the innermost layer, and thus is not dependent on any modules.
 *
 * The File class is the bridge between FileDTO and TypeORM. It allows the File entity
 * to be represented in database as a database table.
 */

import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User, UserDTO } from "./User";

/**
 * Each file has
 *  id: A unique ID assigned to each file
 *  name: A file name
 *  size: The file size in bytes
 *  fileType: The file extension (txt, py, ts, etc.)
 *  numBlobs: Actual file data is broken up into numerous blobs, so this field contains the total number of blobs
 *  blobs: String array, with each element being one part of the actual file.
 *    The size of this array is equal to numBlobs
 *  owner: The owner of this file
 *  createdAt: Creation date and time of the file
 *  updatedAt: Last updated at date and time of the file
 *
 * All fields are metadata except for blobs
 */
export interface FileDTO {
  id: string;
  name: string;
  size: number;
  fileType: string;
  numBlobs: number;
  blobs: string[];
  owner: UserDTO;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Allows the FileDTO to be represented in the database
 * In particular, the owner field is a many-to-one relationship,
 * because a file is owned by one and only one owner
 */
@Entity()
export class File implements FileDTO {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  size!: number; // in KB

  @Column({ nullable: false })
  fileType!: string;

  @Column({ nullable: false })
  numBlobs!: number;

  @Column("simple-array")
  blobs!: string[];

  @ManyToOne(() => User, (user) => user.files, { onDelete: "CASCADE" })
  owner!: UserDTO;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
