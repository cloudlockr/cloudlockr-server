import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { File, FileDTO } from "./File";

export interface UserDTO {
  id: string;
  email: string;
  password: string;
  files: FileDTO[];
  createdAt: Date;
  updatedAt: Date;
}

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
