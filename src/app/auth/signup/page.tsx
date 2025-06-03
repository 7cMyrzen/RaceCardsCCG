import { TopNavbar } from "@/components/website/Navbar";
import SignupForm from "@/components/website/SignupForm";
import { Footer } from "@/components/website/Footer";

export default function Page() {
  return (
    <div className="pt-32 flex flex-col min-h-screen">
      <TopNavbar />
      <main className="flex-grow max-w-[90%] mx-auto">
        <SignupForm />
      </main>
      <Footer />
    </div>
  );
}