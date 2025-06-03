import { TopNavbar } from "@/components/website/Navbar";
import { HeroSectionHome } from "@/components/website/Hero";
import { AccountCreated } from "@/components/website/Alert";
import { Footer } from "@/components/website/Footer";

export default function Page() {
  return (
    <div className="pt-32 flex flex-col min-h-screen">
      <TopNavbar />
      <main className="flex-grow">
      <HeroSectionHome />
      <AccountCreated />
      </main>
      <Footer />
    </div>
  );
}