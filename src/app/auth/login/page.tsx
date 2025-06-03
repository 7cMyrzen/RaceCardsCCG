import { TopNavbar } from "@/components/website/Navbar";
import LoginForm from "@/components/website/LoginForm";
import { Footer } from "@/components/website/Footer";

export default function Page() {
  return (
    <div className="pt-32 flex flex-col min-h-screen">
      <TopNavbar />
      <main className="flex-grow max-w-[90%] mx-auto">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
}