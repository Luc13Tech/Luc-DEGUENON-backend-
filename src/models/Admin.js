import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockedUntil: {
      type: Date,
      default: null,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },

    lastLoginIp: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.methods.isLocked = function () {
  return Boolean(
    this.lockedUntil && this.lockedUntil.getTime() > Date.now()
  );
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.passwordHash;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  delete obj.lastLoginIp;

  return obj;
};

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
