import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    const userResponse = await prisma.user.findUnique({

      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        nb_combat: true,
        nb_victoires: true,
        nb_defaites: true,
        profile_pic: true,
        money: true,
      },
    });

    const nbcarcard = await prisma.userCar.count({
      where: {
        user_id: decoded.id,
      },
    });
    const nbupgradecard = await prisma.userUpgrade.count({
      where: {
        user_id: decoded.id,
      },
    });
    const nb_cartes = nbcarcard + nbupgradecard;
    const user = {
      ...userResponse,
      nb_cartes,
    }
    
    

    if (!userResponse) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: 'Token invalide ou expiré' }, { status: 401 });
  }
}
