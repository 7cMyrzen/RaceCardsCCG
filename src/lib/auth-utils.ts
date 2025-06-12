import { NextRequest } from 'next/server';
import prisma from './prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function getUserFromRequest(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decoded?.id) return null;

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    return user || null;
  } catch {
    return null;
  }
}
