import argon2 from "argon2";
import { Session, SessionData } from "express-session";
import { User } from "../entities/User";

type Sess = Session & Partial<SessionData>;

type returnType = {
  code: number;
  message?: string;
};

class AuthService {
  private sessionRegen(session: Sess, userId: string) {
    return new Promise<void>((resolve) => {
      session.regenerate((_) => {
        session.userId = userId;
        session.refreshTouch = true;
        console.log("refreshed");
        resolve();
      });
    });
  }

  private sessionDestroy(session: Sess) {
    return new Promise<void>((resolve) => {
      session.destroy((_) => {
        resolve();
      });
    });
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
      throw { code: 422, errors };
    }
  }

  public async register(
    session: Sess,
    email: string,
    password: string
  ): Promise<returnType> {
    // Create user in database
    const hashedPassword = await argon2.hash(password);
    let user: User;
    try {
      user = await User.create({
        email,
        password: hashedPassword,
      }).save();
    } catch (err) {
      const errors: Array<any> = [];
      if (err.code === "23505") {
        errors.push({ email: "Email invalid" });
      }
      throw { code: 422, errors };
    }

    // Log user in
    await this.sessionRegen(session, user.id);

    return { code: 200, message: "New account registered" };
  }

  public async login(
    session: Sess,
    email?: string,
    password?: string
  ): Promise<returnType> {
    const errors: Array<any> = [];
    errors.push({ email: "Incorrect email/password combination" });

    if (!email || !password) {
      // Verify that the user didn't send empty fields
      throw { code: 422, errors };
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // No user registered with given email
      throw { code: 422, errors };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      // User entered incorrect password
      throw { code: 422, errors };
    }

    await this.sessionRegen(session, user.id);

    return { code: 200, message: "Logged in" };
  }

  public async logout(session: Sess): Promise<returnType> {
    await this.sessionDestroy(session);
    return { code: 200, message: "Logged out" };
  }

  public authenticated(session: Sess) {
    if (!session.userId) {
      const errors: Array<any> = [];
      errors.push({ auth: "Not authenticated" });
      throw { code: 401, errors };
    }
  }
}

export default new AuthService();
