import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    resourceType: {
      type: String,
      enum: ["image", "video", "raw", "auto"],
      default: "image",
    },

    format: {
      type: String,
      trim: true,
      default: "",
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    bytes: {
      type: Number,
      default: null,
    },

    alt: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    folder: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    deleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

mediaSchema.index({
  deleted: 1,
  createdAt: -1,
});

const Media = mongoose.model("Media", mediaSchema);

export default Media;
