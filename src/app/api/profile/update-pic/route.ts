import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // si ton client Prisma est là

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, profile_pic } = body;

    if (!userId || profile_pic < 1 || profile_pic > 10) {
      return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profile_pic },
    });

    return NextResponse.json({ success: true, updatedUser });
  } catch (error) {
    console.error('Erreur update-profile-pic:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
