import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';  // adapte selon ta config Sequelize sinon

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'; // stocker en .env

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Chercher user dans la base (avec Sequelize ou Prisma selon ton projet)
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 401 });

    // Vérification du mot de passe
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 });

    // Création du token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Création du cookie httpOnly
    const response = NextResponse.json({ message: 'Connexion réussie' });
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (err) {
    console.error("Erreur login:", err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
