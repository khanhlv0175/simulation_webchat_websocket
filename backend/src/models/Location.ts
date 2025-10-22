import mongoose, { Document, Schema } from "mongoose";

export interface ILocation extends Document {
  name: string;
  level: number;
  parentId?: string;
  createdAt: Date;
}

const LocationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  parentId: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster queries
LocationSchema.index({ level: 1, parentId: 1 });

// Add compound unique index for name and level
LocationSchema.index({ name: 1, level: 1 }, { unique: true });

// Add validation for parent-child relationships
LocationSchema.pre("save", async function (next) {
  if (this.parentId) {
    // Cast the parent document to ILocation type
    const parent = (await this.model("Location").findById(
      this.parentId
    )) as ILocation;

    if (!parent) {
      return next(new Error("Parent location not found"));
    }

    if (parent.level >= this.level) {
      return next(new Error("Parent location must be of a lower level"));
    }
  }
  next();
});

const Location = mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
