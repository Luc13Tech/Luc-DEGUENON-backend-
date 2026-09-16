import { SignJWT, jwtVerify } from "jose";
import env from "../config/env.js";

const secretKey = new TextEncoder().encode(env.JWT_SECRET);

export async function createToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyToken(token) {
  if (!token) {
    throw new Error("Token manquant.");
  }

  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS256"],
  });

  return payload;
}
