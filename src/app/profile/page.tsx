'use client';

import { useEffect, useState } from 'react';
import { TopNavbar } from "@/components/website/Navbar";
import { Footer } from "@/components/website/Footer";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'GET',
          credentials: 'include', // IMPORTANT : pour envoyer les cookies httpOnly
        });

        if (!res.ok) {
          const { error } = await res.json();
          setError(error || 'Erreur inconnue');
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        setError('Erreur de chargement');
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return (
      <div className="bg-black h-screen w-screen flex items-center justify-center text-red-500 p-4 rounded shadow-md">
        Erreur : {error}
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="bg-black h-screen w-screen flex items-center justify-center text-white p-4 shadow-md">
        <span className="text-xl font-semibold flex items-center">
          Chargement
          <span className="dot-anim ml-1">.</span>
          <span className="dot-anim ml-1" style={{ animationDelay: '0.2s' }}>.</span>
          <span className="dot-anim ml-1" style={{ animationDelay: '0.4s' }}>.</span>
        </span>
      </div>
    );
  }
  

  return (
    <div className="pt-32 flex flex-col center min-h-screen">
      <TopNavbar />
      <main className="flex-grow max-w-[90%] mx-auto">
          
      </main>
      <Footer />
    </div>
  );
}
