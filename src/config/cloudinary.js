import { v2 as cloudinary } from "cloudinary";
import env from "./env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export async function uploadImage(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || env.CLOUDINARY_FOLDER,
      resource_type: "image",
      quality: "auto",
      fetch_format: "auto",
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    stream.end(fileBuffer);
  });
}

export async function deleteImage(publicId) {
  if (!publicId) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    return result;
  } catch (error) {
    console.error(
      "❌ Erreur lors de la suppression Cloudinary :",
      error.message
    );

    throw error;
  }
}
