/**
 * This module specifies the PostgreSQL database connection.
 *
 * Our ORM of choice is TypeORM, which is an ORM made specifically for TypeScript.
 */

import { ConnectionOptions } from "typeorm";
import { DB_URL, __prod__ } from "../constants";
import { File } from "../entities/File";
import { User } from "../entities/User";

// Database connection configuration for TypeORM
let connOptions: ConnectionOptions;
if (__prod__) {
  /**
   * Specifies the connection options in production.
   * In particular, allow SSL because Heroku Postgres uses SSL to ensure database
   * remains secure.
   */
  connOptions = {
    type: "postgres",
    url: DB_URL,
    entities: [User, File],
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
  /**
   * Specifies the connection options in development.
   * Allow logging for debugging.
   */
  connOptions = {
    type: "postgres",
    url: DB_URL,
    entities: [User, File],
    synchronize: true,
    logging: true,
  };
}

export default connOptions;
