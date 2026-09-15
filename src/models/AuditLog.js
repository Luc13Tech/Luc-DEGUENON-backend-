import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    resource: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },

    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    success: {
      type: Boolean,
      default: true,
      index: true,
    },

    ip: {
      type: String,
      trim: true,
      default: "",
    },

    userAgent: {
      type: String,
      trim: true,
      default: "",
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({
  createdAt: -1,
});

auditLogSchema.index({
  actor: 1,
  createdAt: -1,
});

auditLogSchema.index({
  resource: 1,
  resourceId: 1,
  createdAt: -1,
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
