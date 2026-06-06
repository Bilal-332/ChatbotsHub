import Link from 'next/link';
import { Bot, Github, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16 relative z-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6" aria-label="ChatbotsHub home">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30 shadow-glow-primary">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold tracking-tight text-text-primary">
                Chatbots<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs">
              Enterprise AI knowledge infrastructure. Build, deploy, and scale autonomous AI agents trained on your data.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-6">Product</h4>
            <ul className="flex flex-col gap-4 text-sm text-text-secondary">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-6">Resources</h4>
            <ul className="flex flex-col gap-4 text-sm text-text-secondary">
              <li><Link href="#" className="hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Community</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-text-primary mb-6">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-text-secondary">
              <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Legal</Link></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-text-secondary/60">
            © {new Date().getFullYear()} ChatbotsHub, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" aria-label="GitHub" className="text-text-secondary hover:text-text-primary transition-colors">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="text-text-secondary hover:text-text-primary transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
