import argon2 from "argon2";
import { sign, verify } from "jsonwebtoken";
import { redis } from "../config/redisConfig";
import {
  REFRESH_LIFETIME,
  REFRESH_PREFIX,
  REFRESH_SECRET,
  TOKEN_LIFETIME,
  TOKEN_SECRET,
} from "../constants";
import { User } from "../entities/User";

type returnType = {
  code: number;
  body: {
    userId?: string;
    accessToken?: string;
    refreshToken?: string;
    token_type?: string;
    expires?: number;
    message?: string;
  };
};

// This service handles register, login, logout, refresh token, and authentication
class AuthService {
  private createJWT(id: string, refresh: boolean): string {
    if (refresh) {
      return sign({ id }, REFRESH_SECRET, { expiresIn: REFRESH_LIFETIME });
    } else {
      return sign({ id }, TOKEN_SECRET, { expiresIn: TOKEN_LIFETIME });
    }
  }

  private verifyJWT(token: string, refresh: boolean) {
    if (refresh) {
      return verify(token, REFRESH_SECRET);
    } else {
      return verify(token, TOKEN_SECRET);
    }
  }

  public authenticate(authHeader?: string) {
    const errors: Array<any> = [];

    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      errors.push({ auth: "No access token" });
      throw { code: 401, body: { errors } };
    }

    try {
      return this.verifyJWT(token, false);
    } catch (err) {
      errors.push({ auth: "Invalid access token" });
      throw { code: 403, body: { errors } };
    }
  }

  public registerValidate(
    email?: string,
    password?: string,
    password1?: string
  ) {
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

  public async register(email: string, password: string): Promise<returnType> {
    // Create user in database
    const hashedPassword = await argon2.hash(password);
    let user: User;
    try {
      user = await User.create({
        email,
        password: hashedPassword,
      }).save();
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
    await redis.set(
      `${REFRESH_PREFIX}-${refreshToken}`,
      user.id,
      "ex",
      REFRESH_LIFETIME
    );

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

  public async login(email?: string, password?: string): Promise<returnType> {
    const errors: Array<any> = [];
    errors.push({ email: "Incorrect email/password combination" });

    if (!email || !password) {
      // Verify that the user didn't send empty fields
      throw { code: 422, body: { errors } };
    }

    const user = await User.findOne({ where: { email } });
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
    await redis.set(
      `${REFRESH_PREFIX}-${refreshToken}`,
      user.id,
      "ex",
      REFRESH_LIFETIME
    );

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

  public async logout(refreshToken?: string): Promise<returnType> {
    if (!refreshToken) {
      const errors: Array<any> = [];
      errors.push({ auth: "No refresh token" });
      throw { code: 422, body: { errors } };
    }

    // Remove refresh token from whitelist
    await redis.del(`${REFRESH_PREFIX}-${refreshToken}`);

    return {
      code: 200,
      body: {
        message: "Logged out",
      },
    };
  }

  public async refresh(id?: string, refreshToken?: string) {
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
      this.verifyJWT(refreshToken!, true);
    } catch (err) {
      errors.push({ auth: "Invalid refresh token" });
      throw { code: 403, body: { errors } };
    }

    const userId = await redis.get(`${REFRESH_PREFIX}-${refreshToken}`);
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
}

export default new AuthService();
