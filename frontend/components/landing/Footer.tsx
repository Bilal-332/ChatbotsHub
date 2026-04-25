import Link from 'next/link';
import { Bot, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2.5" aria-label="ChatbotsHub home">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-600 shadow-md">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-700">
              Chatbots<span className="text-primary-600">Hub</span>
            </span>
          </Link>

          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} ChatbotsHub. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="GitHub"
              className="text-gray-400 transition-colors hover:text-gray-700"
            >
              <Github className="h-4.5 w-4.5" />
            </a>
            <a
              href="#"
              aria-label="Twitter"
              className="text-gray-400 transition-colors hover:text-gray-700"
            >
              <Twitter className="h-4.5 w-4.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
