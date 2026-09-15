import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    imagePublicId: {
      type: String,
      trim: true,
      default: "",
    },

    technologies: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
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

projectSchema.index({
  published: 1,
  deleted: 1,
  order: 1,
});

projectSchema.index({
  companyName: 1,
});

const Project = mongoose.model("Project", projectSchema);

export default Project;
