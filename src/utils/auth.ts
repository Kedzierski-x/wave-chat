import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

interface CustomJwtPayload extends JwtPayload {
  id: string;
  name: string;
}

export function verifyToken(token: string): CustomJwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CustomJwtPayload;
  } catch (err) {
    return null;
  }
}
