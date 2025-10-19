import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  username: string;
  password: string;
  role: "admin" | "manager" | "viewer";
  locations?: {
    level1?: string;
    level2?: string;
    level3?: string;
    level4?: string;
    level5?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface Location {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
  level5: string;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: ["admin", "manager", "viewer"],
  },
  locations: {
    level1: String,
    level2: String,
    level3: String,
    level4: String,
    level5: String,
  },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
