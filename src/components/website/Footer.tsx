import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-800 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
        {/* Section liens pages */}
        <nav className="flex flex-col space-y-2 text-center md:text-left">
          <Link href="/about" className="hover:text-white transition">À propos</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
          <Link href="/privacy" className="hover:text-white transition">Politique de confidentialité</Link>
        </nav>

        {/* Section réseaux sociaux */}
        <div className="flex space-x-6">
          <SocialLink
            href="https://twitter.com/tonprofil"
            label="Twitter"
            svgPath="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"
          />
          <SocialLink
            href="https://github.com/tonprofil"
            label="GitHub"
            svgPath="M12 2C6.48 2 2 6.58 2 12.25c0 4.5 2.865 8.31 6.839 9.66.5.09.682-.22.682-.48 0-.237-.008-1.025-.013-1.85-2.782.615-3.37-1.356-3.37-1.356-.454-1.18-1.11-1.495-1.11-1.495-.908-.63.07-.62.07-.62 1.003.07 1.53 1.05 1.53 1.05.892 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.636-1.37-2.22-.26-4.555-1.13-4.555-5.02 0-1.11.39-2.02 1.03-2.73-.105-.26-.446-1.3.1-2.7 0 0 .84-.27 2.75 1.04a9.415 9.415 0 012.5-.34 9.48 9.48 0 012.5.34c1.91-1.31 2.75-1.04 2.75-1.04.546 1.4.205 2.44.1 2.7.64.7 1.03 1.62 1.03 2.73 0 3.9-2.34 4.76-4.57 5.01.36.31.68.93.68 1.87 0 1.35-.01 2.44-.01 2.77 0 .27.18.58.69.48A10.25 10.25 0 0022 12.25C22 6.58 17.52 2 12 2z"
          />
          <SocialLink
            href="https://linkedin.com/in/tonprofil"
            label="LinkedIn"
            svgPath="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z"
          />
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} RaceCards. Tous droits réservés.
      </div>
    </footer>
  );
}

interface SocialLinkProps {
  href: string;
  label: string;
  svgPath: string;
}

function SocialLink({ href, label, svgPath }: SocialLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-gray-400 hover:text-white transition"
    >
      <svg
        className="w-6 h-6"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d={svgPath} />
      </svg>
    </a>
  );
}