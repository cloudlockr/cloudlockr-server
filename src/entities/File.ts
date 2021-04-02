import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User, UserDTO } from "./User";

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
