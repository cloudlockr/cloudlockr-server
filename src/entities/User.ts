import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { File } from "./File";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, nullable: false })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @OneToMany(() => File, (file) => file.owner, { cascade: ["insert", "update", "remove"] })
  files!: File[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
