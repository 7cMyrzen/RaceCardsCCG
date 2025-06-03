import { TopNavbar } from "@/components/website/Navbar";
import { HeroSectionAbout } from "@/components/website/Hero";
import { Footer } from "@/components/website/Footer";

export default function Page() {
  return (
    <div className="pt-32 flex flex-col center min-h-screen">
      <TopNavbar />
      <main className="flex-grow max-w-[90%] mx-auto">
        <HeroSectionAbout />
      </main>
      <Footer />
    </div>
  );
}