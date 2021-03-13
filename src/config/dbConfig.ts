import { ConnectionOptions } from "typeorm";
import { User } from "../entities/User";
import { __prod__ } from "../constants";

// database connection configuration for TypeORM
export default {
  type: "postgres",
  username: process.env.DB_UESRNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User],
  synchronize: true,
  logging: !__prod__,
} as ConnectionOptions;
