"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AccountCreated } from './Alert';
import { useState } from "react";

export default function LoginForm() {
    const [accountCreated, setAccountCreated] = useState(false);
    
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
      
          const data = await res.json();
      
          if (!res.ok) {
            alert(data.error || "Erreur lors de la connexion");
          } else {
            setAccountCreated(true);
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
          }
        } catch (error) {
          alert("Erreur réseau");
        }
      };
      
    return (
        <div className="shadow-input mt-20 mx-auto w-full max-w-md rounded-lg bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black z-10 outline outline-1 outline-neutral-200 dark:outline-neutral-800">
            {accountCreated && <AccountCreated />}
            <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Bienvenue sur RaceCards
            </h2>
            <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
                Connectez-vous à votre compte
            </p>

            <form className="shadow-input w-full rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black" onSubmit={handleSubmit}>
                <div className="my-8">
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" placeholder="joueur1@rc.ccg" type="text" />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input id="password" name="password" placeholder="••••••••" type="password" />
                    </LabelInputContainer>
                    <button
                        className="group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] cursor-pointer"
                        type="submit"
                    >
                        Se Connecter &rarr;
                        <BottomGradient />
                    </button>
                </div>
                <a className="w-full text-black cursor-pointer hover:underline dark:text-white" onClick={() => {window.location.href = "/auth/signup"}}>Pas encore de compte ? Créez-en un !</a>
            </form >
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};
