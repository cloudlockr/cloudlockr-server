/**
 * This module contains the service which handles all business logic relating to
 * user authentication and authorization.
 *
 * The usage of third-party dependencies are as follows:
 *  argon2: Used for encryption and decryption user passwords.
 *  jsonwebtoken: Used for creating new JSON Web Tokens for access and refresh tokens, and also to verify them
 *  ioredis: Only for intellisense, the actual Redis client used is being injected
 */

import argon2 from "argon2";
import { Redis } from "ioredis";
import { sign, verify } from "jsonwebtoken";
import { REFRESH_LIFETIME, REFRESH_PREFIX, REFRESH_SECRET, TOKEN_LIFETIME, TOKEN_SECRET } from "../constants";
import { UserDTO } from "../entities/User";
import { UserDAO } from "../repository/UserRepository";

/**
 * Service for authentication, such as user account registration, login, logout,
 * refreshing access tokens, account deletion
 *
 * Requires dependency injection of a UserRepository and a Redis client
 */
export class AuthServices {
  private readonly userRepository: UserDAO;
  private readonly redis: Redis;

  constructor(userRepository: UserDAO, redis: Redis) {
    this.userRepository = userRepository;
    this.redis = redis;
  }

  /**
   * Helper function for register, login, and refresh.
   * Either creates an access token or a refresh token.
   */
  private createJWT(id: string, refresh: boolean): string {
    if (refresh) {
      return sign({ id }, REFRESH_SECRET, { expiresIn: REFRESH_LIFETIME });
    } else {
      return sign({ id }, TOKEN_SECRET, { expiresIn: TOKEN_LIFETIME });
    }
  }

  /**
   * Helper function for authenticate and refresh.
   * Verifies whether the given token is a valid access or refresh token
   */
  private verifyJWT(token: string, refresh: boolean) {
    if (refresh) {
      return verify(token, REFRESH_SECRET);
    } else {
      return verify(token, TOKEN_SECRET);
    }
  }

  /**
   * Authenticates whether a user has a valid access token.
   * If access token is valid, nothing is returned.
   * If access token is invalid, an error is thrown.
   */
  public authenticate(authHeader?: string) {
    const errors: Array<any> = [];

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      errors.push({ auth: "No access token" });
      throw { code: 401, body: { errors } };
    }

    try {
      return this.verifyJWT(token, false) as payloadType;
    } catch (err) {
      errors.push({ auth: "Invalid access token" });
      throw { code: 403, body: { errors } };
    }
  }

  /**
   * Performs validation on inputs for register.
   * If all inputs are valid, nothing is returned.
   * If any input is invalid, an error is thrown.
   */
  public registerValidate(email?: string, password?: string, password1?: string) {
    const errors: Array<any> = [];

    if (!email || !email.includes("@")) {
      errors.push({ email: "Email invalid" });
    }
    if (!password || password.length < 10) {
      errors.push({ password: "Password must be at least 10 characters long" });
    }
    if (password !== password1) {
      errors.push({ password1: "Passwords do not match" });
    }
    if (errors.length > 0) {
      throw { code: 422, body: { errors } };
    }
  }

  /**
   * Registers a new user with given inputs.
   * If email is already registered, then an error is thrown.
   * Otherwise, refresh and access tokens are created and returned.
   * Refresh token is also saved to the refresh token whitelist
   */
  public async register(email: string, password: string): Promise<returnType> {
    // Create user in database
    const hashedPassword = await argon2.hash(password);
    let user: UserDTO;
    try {
      user = await this.userRepository.createAndSave(email, hashedPassword);
    } catch (err) {
      // Email already associated with an account
      const errors: Array<any> = [];
      if (err.code === "23505") {
        errors.push({ email: "Email already registered" });
      }
      throw { code: 422, body: { errors } };
    }

    // Log user in
    const refreshToken = this.createJWT(user.id, true);
    const accessToken = this.createJWT(user.id, false);

    // Add refresh token to whitelist
    await this.redis.set(`${REFRESH_PREFIX}-${refreshToken}`, user.id, "ex", REFRESH_LIFETIME);

    return {
      code: 201,
      body: {
        userId: user.id,
        refreshToken,
        accessToken,
        token_type: "bearer",
        expires: TOKEN_LIFETIME,
        message: "New account registered",
      },
    };
  }

  /**
   * Logins a user with given inputs.
   * If email or password are undefined / password does not match, an error is thrown.
   * Otherwise, refresh and access tokens are created and returned.
   * Refresh token is also saved to the refresh token whitelist
   */
  public async login(email?: string, password?: string): Promise<returnType> {
    const errors: Array<any> = [];
    errors.push({ email: "Incorrect email/password combination" });

    if (!email || !password) {
      // Verify that the user didn't send empty fields
      throw { code: 422, body: { errors } };
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      // No user registered with given email
      throw { code: 422, body: { errors } };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      // User entered incorrect password
      throw { code: 422, body: { errors } };
    }

    // Log user in
    const refreshToken = this.createJWT(user.id, true);
    const accessToken = this.createJWT(user.id, false);

    // Add refresh token to whitelist
    await this.redis.set(`${REFRESH_PREFIX}-${refreshToken}`, user.id, "ex", REFRESH_LIFETIME);

    return {
      code: 200,
      body: {
        userId: user.id,
        refreshToken,
        accessToken,
        token_type: "bearer",
        expires: TOKEN_LIFETIME,
        message: "Logged in",
      },
    };
  }

  /**
   * Logout a user.
   * If refreshToken is not provided, an error is thrown
   * Otherwise, deletes refresh token from token whitelist and returns success.
   */
  public async logout(refreshToken?: string): Promise<returnType> {
    if (!refreshToken) {
      const errors: Array<any> = [];
      errors.push({ auth: "No refresh token" });
      throw { code: 422, body: { errors } };
    }

    // Remove refresh token from whitelist
    await this.redis.del(`${REFRESH_PREFIX}-${refreshToken}`);

    return {
      code: 200,
      body: {
        message: "Logged out",
      },
    };
  }

  /**
   * Provides a new access token given a refresh token.
   * Also requires the user to provide a matching id with that refresh token.
   * If any inputs are invalid, an error is thrown.
   * If the refresh token is not valid (forged/expired), an error is thrown.
   * If the refresh token has already been revoked (user logged out), an error is thrown.
   * Lastly, if the refresh token payload does not match the id given, an error is thrown.
   * Otherwise, a new access token is created and returned
   */
  public async refresh(id?: string, refreshToken?: string): Promise<returnType> {
    const errors: Array<any> = [];

    if (!id) {
      errors.push({ auth: "No user id" });
    }
    if (!refreshToken) {
      errors.push({ auth: "No refresh token" });
    }
    if (errors.length > 0) {
      throw { code: 401, body: { errors } };
    }

    try {
      // Verify that the refresh token is valid
      this.verifyJWT(refreshToken!, true);
    } catch (err) {
      errors.push({ auth: "Invalid refresh token" });
      throw { code: 403, body: { errors } };
    }

    const userId = await this.redis.get(`${REFRESH_PREFIX}-${refreshToken}`);
    if (!userId) {
      // Verify that the refresh token has not been revoked
      errors.push({ auth: "Revoked refresh token" });
      throw { code: 403, body: { errors } };
    }
    if (id !== userId) {
      // Verify that the sender of the refresh token is actually the user
      errors.push({ auth: "Invalid user token pair" });
      throw { code: 403, body: { errors } };
    }
    const accessToken = this.createJWT(id!, false);

    return {
      code: 200,
      body: {
        accessToken,
        token_type: "bearer",
        expires: TOKEN_LIFETIME,
        message: "Refreshed",
      },
    };
  }

  /**
   * Deletes a user from database.
   * If refresh token is not provided, an error is thrown.
   * Otherwise, deletes user from database and
   * deletes refresh token from token whitelist and returns success.
   */
  public async delete(id: string, refreshToken?: string): Promise<returnType> {
    if (!refreshToken) {
      const errors: Array<any> = [];
      errors.push({ auth: "No refresh token" });
      throw { code: 422, body: { errors } };
    }

    // Remove refresh token from whitelist
    await this.redis.del(`${REFRESH_PREFIX}-${refreshToken}`);

    await this.userRepository.deleteById(id);

    return {
      code: 200,
      body: {
        message: "Account deleted",
      },
    };
  }

  /**
   * Gets all files owned by the user specified by the given id.
   * If the user does not exist in the database, an error is thrown.
   * Otherwise, the metadata of all the files owned by the user is returned.
   */
  public async getFiles(id: string): Promise<returnType> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      // User doesn't exist in database
      const errors: Array<any> = [];
      errors.push({ user: "No user with this ID" });
      throw { code: 422, body: { errors } };
    }

    const users = await this.userRepository.findFiles(user.id);
    const files = users[0].files;
    // Only retrieve the metadata of the files, not the actual file data
    const filesMetadata = files.map(({ blobs, ...file }) => {
      return file;
    });

    return {
      code: 200,
      body: {
        filesMetadata,
        message: "Files found",
      },
    };
  }
}
