import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class File {
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
  owner!: User;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
