import { ConnectionOptions } from "typeorm";
import { User } from "../entities/User";
import { DB_NAME, DB_PASSWORD, DB_USERNAME, __prod__ } from "../constants";

// database connection configuration for TypeORM
export default {
  type: "postgres",
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: [User],
  synchronize: true,
  logging: !__prod__,
} as ConnectionOptions;
