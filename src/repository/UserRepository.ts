/**
 * This module contains the UserDAO, which specifies the methods used for user CRUD operations.
 * Defining DAOs allow for easy dependency injection, as no matter which ORM is used, as long as
 * we can define custom methods for CRUD which aligns with the interface defined in the DAO,
 * it can be injected into wherever it needs to be used without changing any other code.
 *
 * The UserRepository defines the custom methods for TypeORM to perform CRUD operations on the
 * User entity in the database.
 */

import { AbstractRepository, EntityRepository } from "typeorm";
import { User, UserDTO } from "../entities/User";

/**
 * The required user CRUD operations are:
 *  createAndSave: Insert a new user entity to the database table with the given inputs
 *  findFiles: Query the database for all the files that a user entity owns given his/her ID
 *  findById: Query the database for the user entity given his/her ID
 *  findByEmail: Query the database for the user entity given their email
 *  deleteById: Delete a user entity from the database given his/her ID
 */
export interface UserDAO {
  createAndSave(email: string, password: string): any;
  findFiles(id: string): Promise<UserDTO[]>;
  findById(id: string): any;
  findByEmail(email: string): any;
  deleteById(id?: string): any;
}

/**
 * Implements the required user CRUD operations for TypeORM
 */
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
    return this.repository.delete(id!);
  }
}
