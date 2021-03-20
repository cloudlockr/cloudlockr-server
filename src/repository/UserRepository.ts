import { AbstractRepository, EntityRepository } from "typeorm";
import { User } from "../entities/User";

@EntityRepository(User)
export class UserRepository extends AbstractRepository<User> {
  createAndSave(email: string, password: string) {
    const user = new User();
    user.email = email;
    user.password = password;
    return this.manager.save(user);
  }

  findByEmail(email: string) {
    return this.repository.findOne({ email });
  }

  deleteById(id?: string) {
    // TODO: delete all user files!
    return this.repository.delete({ id });
  }
}
