/**
 * Footer — Wikipedia Learn
 * Style: Archives Vivantes — pied de page sobre, typographie encyclopédique
 */

import { Link } from 'wouter';

export default function Footer() {
  return (
    <footer className="border-t border-[oklch(0.86_0.02_75)] mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Link href="/archives" className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.18_0.02_60)] uppercase transition-colors">
              The Archives
            </Link>
            <Link href="/curation" className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.18_0.02_60)] uppercase transition-colors">
              Curation Policy
            </Link>
            <Link href="/privacy" className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.18_0.02_60)] uppercase transition-colors">
              Privacy
            </Link>
          </div>
          <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.65_0.015_70)] uppercase">
            Wiki Learn, For Knowledge &copy; 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
