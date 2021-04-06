/**
 * This module contains the entity/model User, which is the interface UserDTO.
 * UserDTO contains all the requisite fields that represents the User entity.
 * In the Clean Architecture, UserDTO is the innermost layer, and thus is not dependent on any modules.
 *
 * The User class is the bridge between UserDTO and TypeORM. It allows the User entity
 * to be represented in database as a database table.
 */

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { File, FileDTO } from "./File";

/**
 * Each user has
 *  id: A unique ID assigned to each user
 *  email: The email which the user registers their account with
 *  password: The password associated with the user email. Used for user authentication
 *  files: An array of files which the user owns
 *  createdAt: Creation date and time of the account
 *  updatedAt: Last updated at date and time of the account
 */
export interface UserDTO {
  id: string;
  email: string;
  password: string;
  files: FileDTO[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Allows the UserDTO to be represented in the database
 * In particular, the files field is a one-to-many relationship,
 * because one user can have many files
 */
@Entity()
export class User implements UserDTO {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @OneToMany(() => File, (file) => file.owner, { cascade: ["insert", "update", "remove"] })
  files!: FileDTO[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
