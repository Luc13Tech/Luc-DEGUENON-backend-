import Profile from "../models/Profile.js";
import { writeAuditLog } from "../services/audit.service.js";

function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    ""
  );
}

export async function getProfile(req, res) {
  const profile = await Profile.findOne({
    isPublished: true,
  }).sort({ createdAt: -1 });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Profil introuvable.",
    });
  }

  return res.json({
    success: true,
    profile,
  });
}

export async function getAdminProfile(req, res) {
  const profile = await Profile.findOne().sort({
    createdAt: -1,
  });

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Profil introuvable.",
    });
  }

  return res.json({
    success: true,
    profile,
  });
}

export async function createProfile(req, res) {
  const existingProfile = await Profile.findOne();

  if (existingProfile) {
    return res.status(409).json({
      success: false,
      message:
        "Un profil existe déjà. Utilisez la modification.",
    });
  }

  const profile = await Profile.create(req.body);

  await writeAuditLog({
    actor: req.admin._id,
    action: "PROFILE_CREATED",
    resource: "Profile",
    resourceId: profile._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  return res.status(201).json({
    success: true,
    message: "Profil créé avec succès.",
    profile,
  });
}

export async function updateProfile(req, res) {
  let profile = await Profile.findOne();

  if (!profile) {
    profile = await Profile.create(req.body);
  } else {
    const allowedFields = [
      "fullName",
      "title",
      "bio",
      "shortBio",
      "photoUrl",
      "photoPublicId",
      "email",
      "phone",
      "location",
      "website",
      "github",
      "linkedin",
      "whatsapp",
      "facebook",
      "instagram",
      "isPublished",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        profile[field] = req.body[field];
      }
    }

    await profile.save();
  }

  await writeAuditLog({
    actor: req.admin._id,
    action: "PROFILE_UPDATED",
    resource: "Profile",
    resourceId: profile._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  return res.json({
    success: true,
    message: "Profil mis à jour avec succès.",
    profile,
  });
}

export async function deleteProfilePhoto(req, res) {
  const profile = await Profile.findOne();

  if (!profile) {
    return res.status(404).json({
      success: false,
      message: "Profil introuvable.",
    });
  }

  profile.photoUrl = "";
  profile.photoPublicId = "";

  await profile.save();

  await writeAuditLog({
    actor: req.admin._id,
    action: "PROFILE_PHOTO_REMOVED",
    resource: "Profile",
    resourceId: profile._id,
    success: true,
    ip: getClientIp(req),
    userAgent: req.headers["user-agent"] || "",
  });

  return res.json({
    success: true,
    message: "Photo du profil supprimée.",
    profile,
  });
}
