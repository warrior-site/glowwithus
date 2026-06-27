import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable inside .env.local");
}

/**
 * Generates a signed JWT session token valid for 7 days
 */
export function createToken(payload) { 
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Synchronously or asynchronously verifies a JWT string token safely
 * Returns the payload objects if valid, or null if expired/tampered
 */
export function verifyToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null; // Token expired, invalid signature, etc.
  }
}