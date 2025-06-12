import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    // Vérifier si email existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const userId = user.id;

    // 2. Cartes à ajouter
    const carIds = [1, 2, 6];
    const upgradeIds = [1, 2];

    // 3. Ajout dans UserCar
    await prisma.userCar.createMany({
      data: carIds.map((carId) => ({
        user_id: userId,
        car_id: carId,
      })),
    });

    // 4. Ajout dans UserUpgrade
    await prisma.userUpgrade.createMany({
      data: upgradeIds.map((upgradeId) => ({
        user_id: userId,
        upgrade_id: upgradeId,
      })),
    });

    // 5. Création du deck
    const deck = await prisma.deck.create({
      data: {
        name: "default",
        is_active: true,
        user_id: userId,
      },
    });

    const deckId = deck.id;

    // 6. Ajout des cartes dans le deck
    await prisma.deckCar.createMany({
      data: carIds.map((carId) => ({
        deck_id: deckId,
        car_id: carId,
      })),
    });

    await prisma.deckUpgrade.createMany({
      data: upgradeIds.map((upgradeId) => ({
        deck_id: deckId,
        upgrade_id: upgradeId,
      })),
    });

    // Créer le token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Créer un cookie httpOnly
    const response = NextResponse.json({ message: "Utilisateur créé et connecté" });
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
