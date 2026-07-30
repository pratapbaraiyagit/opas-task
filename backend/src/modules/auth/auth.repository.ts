import { User, IUser } from './auth.model';

export class AuthRepository {
  async findById(id: string): Promise<IUser | null> {
    return User.findById(id);
  }

  async findByIdWithPassword(id: string): Promise<IUser | null> {
    return User.findById(id).select('+password');
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findByEmailWithPassword(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password +tokenVersion');
  }

  async findByVerificationToken(token: string): Promise<IUser | null> {
    return User.findOne({
      verificationToken: token,
      verificationTokenExpiry: { $gt: new Date() },
    }).select('+verificationToken +verificationTokenExpiry');
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordTokenExpiry +password');
  }

  async create(data: { name: string; email: string; password: string }): Promise<IUser> {
    const user = new User(data);
    return user.save();
  }

  async updateVerificationToken(
    userId: string,
    token: string,
    expiry: Date,
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { verificationToken: token, verificationTokenExpiry: expiry },
      { new: true },
    );
  }

  async markAsVerified(userId: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        verified: true,
        $unset: { verificationToken: 1, verificationTokenExpiry: 1 },
      },
      { new: true },
    );
  }

  async updateResetToken(
    userId: string,
    token: string,
    expiry: Date,
  ): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { resetPasswordToken: token, resetPasswordTokenExpiry: expiry },
      { new: true },
    );
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        $unset: { resetPasswordToken: 1, resetPasswordTokenExpiry: 1 },
        $inc: { tokenVersion: 1 },
      },
      { new: true },
    );
  }

  async incrementTokenVersion(userId: string): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true },
    );
  }
}
