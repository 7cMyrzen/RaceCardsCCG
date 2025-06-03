-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_pic" INTEGER NOT NULL DEFAULT 1,
    "role" "Role" NOT NULL DEFAULT 'user',
    "money" INTEGER NOT NULL DEFAULT 30,
    "nb_combat" INTEGER NOT NULL DEFAULT 0,
    "nb_cartes" INTEGER NOT NULL DEFAULT 3,
    "nb_victoires" INTEGER NOT NULL DEFAULT 0,
    "nb_defaites" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
