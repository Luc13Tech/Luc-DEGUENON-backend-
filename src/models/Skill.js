import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    category: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    icon: {
      type: String,
      trim: true,
      default: "",
    },

    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    published: {
      type: Boolean,
      default: true,
      index: true,
    },

    order: {
      type: Number,
      default: 0,
      index: true,
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

skillSchema.index({
  published: 1,
  deleted: 1,
  order: 1,
});

skillSchema.index({
  category: 1,
});

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
