import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, newUsername } = body;

    if (!userId || !newUsername) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Erreur API:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
