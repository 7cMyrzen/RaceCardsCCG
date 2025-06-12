'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type UserProfile = {
    username: string;
    id: string;
    email: string;
    nb_combat: number;
    nb_victoires: number;
    nb_defaites: number;
    profile_pic: number;
    nb_cartes: number;
    money: number;
};

export const Profile = ({ user }: { user: UserProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPic, setSelectedPic] = useState(user.profile_pic);
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState(user.username);


    const router = useRouter();

    const handlePicClick = () => {
        setIsEditing(true);
    };

    const handleSelect = async (picId: number) => {
        setSelectedPic(picId);
        setIsEditing(false);

        await fetch('/api/profile/update-pic', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: user.id, profile_pic: picId }),
        });
    };

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        setIsLoggedIn(true);
                    }
                } else {
                    setIsLoggedIn(false);
                }
            } catch {
                setIsLoggedIn(false);
            }
        };

        checkAuth();
    }, []);

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                setIsLoggedIn(false);
                router.push("/auth/login"); // redirige après déconnexion
            } else {
                console.error("Erreur lors de la déconnexion");
            }
        } catch (err) {
            console.error("Erreur lors de la déconnexion", err);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = confirm('Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.');
        if (!confirmed) return;

        try {
            const res = await fetch('/api/profile/delete-user', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            if (res.ok) {
                setIsLoggedIn(false); // Facultatif si tu gères un état global
                router.push('/auth/login'); // ou redirection vers accueil : "/"
            } else {
                console.error('Erreur lors de la suppression du compte');
            }
        } catch (err) {
            console.error('Erreur lors de la suppression du compte', err);
        }
    };


    return (
        <div className="w-[90%] mx-auto bg-zinc-900 text-white p-6 rounded-xl shadow-lg space-y-8">
            {/* Profil */}
            <div className="flex flex-col items-center space-y-2">
                <Image
                    width={96}
                    height={96}
                    src={`/images/profiles/${selectedPic}.png`}
                    alt={`Avatar ${selectedPic}`}
                    className="rounded-full border-4 border-gray-600 cursor-pointer"
                    onClick={handlePicClick}
                />
                <div className="flex items-center space-x-2">
                    {isEditingUsername ? (
                        <>
                            <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="bg-zinc-700 px-2 py-1 rounded text-white"
                            />
                            <button
                                onClick={async () => {
                                    const res = await fetch('/api/profile/update-username', {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ userId: user.id, newUsername }),
                                    });

                                    if (res.ok) {
                                        setIsEditingUsername(false);
                                    } else {
                                        alert("Erreur lors de la mise à jour du pseudo.");
                                    }
                                }}
                                className="bg-green-600 px-2 py-1 rounded hover:bg-green-700 text-sm"
                            >
                                ✅
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold">{newUsername}</h2>
                            <button
                                onClick={() => setIsEditingUsername(true)}
                                className="text-sm text-blue-400 hover:text-blue-500"
                                title="Modifier le pseudo"
                            >
                                ✏️
                            </button>
                        </>
                    )}
                </div>

                <p className="text-sm text-gray-400">ID : {user.id}</p>
                <p className="text-sm text-gray-400">{user.email}</p>
            </div>

            {isEditing && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((pic) => (
                        <Image
                            key={pic}
                            width={64}
                            height={64}
                            src={`/images/profiles/${pic}.png`}
                            alt={`Avatar ${pic}`}
                            className={`rounded-full border-2 ${selectedPic === pic ? 'border-green-500' : 'border-gray-400'
                                } cursor-pointer`}
                            onClick={() => handleSelect(pic)}
                        />
                    ))}
                </div>
            )}

            {/* Combats */}
            <div className="bg-zinc-800 p-4 rounded-lg space-y-2">
                <h3 className="text-xl font-semibold mb-2">Combat</h3>
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Nombre de combats :</strong> {user.nb_combat}</p>
                    <p><strong>Victoires :</strong> {user.nb_victoires}</p>
                    <p><strong>Défaites :</strong> {user.nb_defaites}</p>
                </div>
            </div>

            {/* Cartes */}
            <div className="bg-zinc-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Cartes</h3>
                <p><strong>Nombre de cartes :</strong> {user.nb_cartes}</p>
            </div>

            {/* Crédits */}
            <div className="bg-zinc-800 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Crédit</h3>
                <p><strong>Nombre de crédits :</strong> {user.money}</p>
            </div>

            {/* Actions */}
            <div className="flex justify-center mt-6">
                <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg mr-4"
                >
                    Se déconnecter
                </button>
                <button
                    onClick={handleDeleteAccount}
                    className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg ml-4"
                >
                    Supprimer le compte
                </button>
            </div>
        </div>
    );
};
