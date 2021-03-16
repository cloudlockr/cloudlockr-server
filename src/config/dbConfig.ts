import { ConnectionOptions } from "typeorm";
import { DB_URL, __prod__ } from "../constants";
import { User } from "../entities/User";

// database connection configuration for TypeORM
export default {
  type: "postgres",
  host: "db",
  port: 5432,
  url: DB_URL,
  entities: [User],
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  synchronize: true,
  logging: !__prod__,
} as ConnectionOptions;
