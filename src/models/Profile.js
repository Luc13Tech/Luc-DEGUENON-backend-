import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    bio: {
      type: String,
      trim: true,
      default: "",
    },

    shortBio: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    photoUrl: {
      type: String,
      trim: true,
      default: "",
    },

    photoPublicId: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    github: {
      type: String,
      trim: true,
      default: "",
    },

    linkedin: {
      type: String,
      trim: true,
      default: "",
    },

    whatsapp: {
      type: String,
      trim: true,
      default: "",
    },

    facebook: {
      type: String,
      trim: true,
      default: "",
    },

    instagram: {
      type: String,
      trim: true,
      default: "",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
