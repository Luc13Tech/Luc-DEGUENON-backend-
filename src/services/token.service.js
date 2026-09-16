import { SignJWT } from "jose";

import env from "../config/env.js";

function getJwtKey() {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function createAccessToken(admin) {
  return new SignJWT({
    role: admin.role,
    email: admin.email,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(admin._id.toString())
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(getJwtKey());
}
