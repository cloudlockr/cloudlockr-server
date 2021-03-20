import { AuthServices } from "./auth";
import { REFRESH_PREFIX } from "../constants";

const EXIST_EMAIL = "user0@email.com";
const NON_EXIST_EMAIL = "user1@email.com";
const REVOKED_TOKEN = "expired";
const WRONG_PASSWORD = "12345";
const PASSWORD = "1234567890";

/**
 * Mocking dependency injection for TypeORM UserRepository
 */
class mockUserRepository {
  createAndSave(email: string, password: string) {
    // This condition serves to mock the event in which an unknown error is thrown
    if (password.length < 10) {
      throw { code: "0" };
    }

    // Doesn't throw error as long as email is not user0@email.com
    if (email !== EXIST_EMAIL) {
      return { id: email, password: PASSWORD };
    } else {
      throw { code: "23505" };
    }
  }

  findByEmail(email: string) {
    if (email === EXIST_EMAIL) {
      return { id: email, password: PASSWORD };
    } else {
      return undefined;
    }
  }

  deleteById(_id?: string) {}
}

/**
 * Mocking dependency injection for IORedis
 */
class mockRedis {
  constructor() {}

  async get(key: string) {
    if (key === `${REFRESH_PREFIX}-${EXIST_EMAIL}`) {
      return EXIST_EMAIL;
    } else if (key === `${REFRESH_PREFIX}-${REVOKED_TOKEN}`) {
      return null;
    } else {
      return null;
    }
  }

  async set(_key: string, _value: string, _exMode: string, _exTime: number) {}

  async del(_key: string) {}
}

/**
 * Mocking argon2 with jest
 */
jest.mock("argon2", () => {
  return {
    hash: jest.fn().mockImplementation((plain: string) => {
      return plain;
    }),
    verify: jest.fn().mockImplementation((hash: string, plain: string) => {
      return hash === plain;
    }),
  };
});

/**
 * Mocking jsonwebtoken with jest
 */
jest.mock("jsonwebtoken", () => {
  return {
    sign: jest
      .fn()
      .mockImplementation(
        (
          payload: { id: string },
          secret: string,
          options: { expiresIn: string }
        ) => {
          return {
            id: payload.id,
            secret: secret,
            expiresIn: options.expiresIn,
          };
        }
      ),
    verify: jest.fn().mockImplementation((token: string, _secret: string) => {
      if (token === EXIST_EMAIL || token === REVOKED_TOKEN) {
        return token;
      } else {
        throw "Invalid refresh token";
      }
    }),
  };
});

let authServices: AuthServices;
beforeAll(() => {
  const userRepository = new mockUserRepository();
  const redis = new mockRedis();
  authServices = new AuthServices(userRepository as any, redis as any);
});

/**
 * Four tests for authenticate
 * 1. Authenticate with no access token, expect error
 * 2. Authenticate without token type "bearer", expect error
 * 3. Authenticate with invalid/expired access token, expect error
 * 4. Authenticate with a valid access token, expect success
 */
test("Authenticate undefined input", () => {
  try {
    authServices.authenticate();
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(401);
    expect(err.body.errors[0].auth).toBe("No access token");
  }
});

test("Authenticate without token type", () => {
  try {
    authServices.authenticate(NON_EXIST_EMAIL);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(401);
    expect(err.body.errors[0].auth).toBe("No access token");
  }
});

test("Authenticate with invalid/expired access token", () => {
  try {
    authServices.authenticate(`bearer ${NON_EXIST_EMAIL}`);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(403);
    expect(err.body.errors[0].auth).toBe("Invalid access token");
  }
});

test("Authenticate with valid access token", () => {
  try {
    const result = authServices.authenticate(`bearer ${EXIST_EMAIL}`);
    expect(result).not.toBeUndefined();
  } catch (err) {
    expect(true).toBe(false);
  }
});

/**
 * Four tests for register validate
 * 1. All inputs are undefined, expect errors
 * 2. Email and password are invalid, password1 undefined, expect errors
 * 3. Email and passwrd are valid, password1 doesn't match password, expect errors
 * 4. All inputs valid, expect success
 */
test("Register validate undefined inputs", () => {
  try {
    authServices.registerValidate();
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe("Email invalid");
    expect(err.body.errors[1].password).toBe(
      "Password must be at least 10 characters long"
    );
  }
});

test("Register validate invalid email and short password", () => {
  try {
    authServices.registerValidate("hello", WRONG_PASSWORD);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe("Email invalid");
    expect(err.body.errors[1].password).toBe(
      "Password must be at least 10 characters long"
    );
    expect(err.body.errors[2].password1).toBe("Passwords do not match");
  }
});

test("Register validate valid email but unmatching passwords", () => {
  try {
    authServices.registerValidate(NON_EXIST_EMAIL, PASSWORD, "123");
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].password1).toBe("Passwords do not match");
  }
});

test("Register validate valid inputs", () => {
  try {
    authServices.registerValidate(NON_EXIST_EMAIL, PASSWORD, PASSWORD);
    expect(true).toBe(true);
  } catch (err) {
    expect(true).toBe(false);
  }
});

/**
 * Two tests for register
 * 1. Register with an email that is already registered, expect errors
 * 2. Register with valid unused email, expect success
 */
test("Register with already registered email", async () => {
  try {
    await authServices.register(EXIST_EMAIL, PASSWORD);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe("Email already registered");
  }
});

test("Register output unknown error", async () => {
  try {
    await authServices.register(EXIST_EMAIL, WRONG_PASSWORD);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors).toHaveLength(0);
  }
});

test("Register with valid email", async () => {
  try {
    const result = await authServices.register(NON_EXIST_EMAIL, PASSWORD);
    expect(result.code).toBe(201);
    expect(result.body.userId).toBe(NON_EXIST_EMAIL);
    expect(result.body.refreshToken).not.toBeUndefined();
    expect(result.body.accessToken).not.toBeUndefined();
    expect(result.body.token_type).toBe("bearer");
    expect(result.body.expires).toBe(900);
    expect(result.body.message).toBe("New account registered");
  } catch (err) {
    expect(true).toBe(false);
  }
});

/**
 * Four tests for login
 * 1. Login with undefined inputs, expect errors
 * 2. Login with email that is not registered yet, expect errors
 * 3. Login with wrong password, expect errors
 * 4. Login with correct email and password, expect success
 */
test("Login undefined inputs", async () => {
  try {
    await authServices.login();
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe(
      "Incorrect email/password combination"
    );
  }

  try {
    await authServices.login(EXIST_EMAIL);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe(
      "Incorrect email/password combination"
    );
  }

  try {
    await authServices.login(undefined, PASSWORD);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe(
      "Incorrect email/password combination"
    );
  }
});

test("Login with unregistered email", async () => {
  try {
    await authServices.login(NON_EXIST_EMAIL, PASSWORD);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe(
      "Incorrect email/password combination"
    );
  }
});

test("Login with unmatching password", async () => {
  try {
    await authServices.login(EXIST_EMAIL, WRONG_PASSWORD);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].email).toBe(
      "Incorrect email/password combination"
    );
  }
});

test("Login with correct credentials", async () => {
  try {
    const result = await authServices.login(EXIST_EMAIL, PASSWORD);
    expect(result.code).toBe(200);
    expect(result.body.userId).toBe(EXIST_EMAIL);
    expect(result.body.refreshToken).not.toBeUndefined();
    expect(result.body.accessToken).not.toBeUndefined();
    expect(result.body.token_type).toBe("bearer");
    expect(result.body.expires).toBe(900);
    expect(result.body.message).toBe("Logged in");
  } catch (err) {
    expect(true).toBe(false);
  }
});

/**
 * Two tests for logout
 * 1. Logout with no refresh token, expect errors
 * 2. Logout with refresh token, doesn't matter if it's valid, expect success
 */
test("Logout with no refresh token", async () => {
  try {
    await authServices.logout();
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].auth).toBe("No refresh token");
  }
});

test("Logout successful", async () => {
  try {
    const result = await authServices.logout(EXIST_EMAIL);
    expect(result.code).toBe(200);
    expect(result.body.message).toBe("Logged out");
  } catch (err) {
    expect(true).toBe(false);
  }
});

/**
 * Five tests for refresh
 * 1. Refresh with undefined inputs, expect errors
 * 2. Refresh with refresh token which is invalid/expired, expect errors
 * 3. Refresh with refresh token which is not expired but revoked, expect errors
 * 4. Refresh with unowned refresh token, expect errors
 * 5. Refresh with owned valid refresh token, expect success
 */
test("Refresh with undefined inputs", async () => {
  try {
    await authServices.refresh();
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(401);
    expect(err.body.errors[0].auth).toBe("No user id");
    expect(err.body.errors[1].auth).toBe("No refresh token");
  }

  try {
    await authServices.refresh(EXIST_EMAIL);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(401);
    expect(err.body.errors[0].auth).toBe("No refresh token");
  }

  try {
    await authServices.refresh(undefined, EXIST_EMAIL);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(401);
    expect(err.body.errors[0].auth).toBe("No user id");
  }
});

test("Refresh with invalid/expired refresh token", async () => {
  try {
    await authServices.refresh(EXIST_EMAIL, NON_EXIST_EMAIL);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(403);
    expect(err.body.errors[0].auth).toBe("Invalid refresh token");
  }
});

test("Refresh with revoked refresh token", async () => {
  try {
    await authServices.refresh(EXIST_EMAIL, REVOKED_TOKEN);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(403);
    expect(err.body.errors[0].auth).toBe("Revoked refresh token");
  }
});

test("Refresh with unowned refresh token", async () => {
  try {
    await authServices.refresh(NON_EXIST_EMAIL, EXIST_EMAIL);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(403);
    expect(err.body.errors[0].auth).toBe("Invalid user token pair");
  }
});

test("Refresh with valid id and refresh token", async () => {
  try {
    const result = await authServices.refresh(EXIST_EMAIL, EXIST_EMAIL);
    expect(result.code).toBe(200);
    expect(result.body.accessToken).not.toBeUndefined();
    expect(result.body.token_type).toBe("bearer");
    expect(result.body.expires).toBe(900);
    expect(result.body.message).toBe("Refreshed");
  } catch (err) {
    expect(true).toBe(false);
  }
});

/**
 * Three tests for delete
 * 1. Delete with undefined inputs, expect errors
 * 2. Delete with undefined id and valid refreshToken, should never happen so expect success
 * 3. Delete with defined id and refreshToken, expect success
 */
test("Delete with undefined inputs", async () => {
  try {
    await authServices.delete();
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].auth).toBe("No refresh token");
  }

  try {
    await authServices.delete(EXIST_EMAIL);
    expect(true).toBe(false);
  } catch (err) {
    expect(err.code).toBe(422);
    expect(err.body.errors[0].auth).toBe("No refresh token");
  }
});

test("Delete with undefined id", async () => {
  try {
    const result = await authServices.delete(undefined, EXIST_EMAIL);
    expect(result.code).toBe(200);
    expect(result.body.message).toBe("Account deleted");
  } catch (err) {
    expect(true).toBe(false);
  }
});

test("Delete with valid id and refreshToken", async () => {
  try {
    const result = await authServices.delete(EXIST_EMAIL, EXIST_EMAIL);
    expect(result.code).toBe(200);
    expect(result.body.message).toBe("Account deleted");
  } catch (err) {
    expect(true).toBe(false);
  }
});
