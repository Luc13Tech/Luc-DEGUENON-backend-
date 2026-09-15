import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
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

    features: {
      type: [String],
      default: [],
    },

    price: {
      type: Number,
      min: 0,
      default: 0,
    },

    priceLabel: {
      type: String,
      trim: true,
      default: "",
      maxlength: 100,
    },

    currency: {
      type: String,
      trim: true,
      default: "XOF",
      maxlength: 10,
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

serviceSchema.index({
  published: 1,
  deleted: 1,
  order: 1,
});

const Service = mongoose.model("Service", serviceSchema);

export default Service;
