import { AbstractRepository, EntityRepository } from "typeorm";
import { User } from "../entities/User";

export interface UserDAO {
  createAndSave(email: string, password: string): any;
  findFiles(id: string): Promise<User[]>;
  findById(id: string): any;
  findByEmail(email: string): any;
  deleteById(id?: string): any;
}

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> implements UserDAO {
  createAndSave(email: string, password: string) {
    const user = new User();
    user.email = email;
    user.password = password;
    user.files = [];
    return this.manager.save(user);
  }

  findFiles(id: string) {
    return this.repository.find({ relations: ["files"], where: { id: id } });
  }

  findById(id: string) {
    return this.repository.findOne({ id });
  }

  findByEmail(email: string) {
    return this.repository.findOne({ email });
  }

  deleteById(id?: string) {
    // TODO: delete all user files!
    return this.repository.delete(id!);
  }
}
