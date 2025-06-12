import { TopNavbar } from "@/components/website/Navbar";
import { Footer } from "@/components/website/Footer";

export default function Page() {
  return (
    <div className="pt-32 flex flex-col min-h-screen">
      <TopNavbar />
      <main className="flex-grow max-w-[90%] mx-auto flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold mb-4">Oops...</h1>
        <p className="text-xl mb-8">La page que vous recherchez semble introuvable.</p>
        <div className="flex gap-4">
          <a
            href="/"
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retour à l'accueil
          </a>
          <a
            href="/game"
            className="px-6 py-3 bg-white text-black border-2 border-black rounded-lg hover:bg-gray-100 transition-colors"
          >
            Aller au jeu
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}