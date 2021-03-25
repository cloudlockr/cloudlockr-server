import { ConnectionOptions } from "typeorm";
import { DB_URL, __prod__ } from "../constants";
import { User } from "../entities/User";

// database connection configuration for TypeORM
let connOptions: ConnectionOptions;
if (__prod__) {
  connOptions = {
    type: "postgres",
    url: DB_URL,
    entities: [User],
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    synchronize: true,
    logging: false,
  };
} else {
  connOptions = {
    type: "postgres",
    url: DB_URL,
    entities: [User],
    synchronize: true,
    logging: true,
  };
}

export default connOptions;
