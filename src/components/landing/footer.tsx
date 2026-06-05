import Link from "next/link";
import { Logo } from "@/components/logo";

const links = {
  Product:   ["Features", "Templates", "Pricing", "Changelog"],
  Resources: ["Blog", "Documentation", "API Reference", "Status"],
  Company:   ["About", "Careers", "Press", "Contact"],
  Legal:     ["Privacy", "Terms", "Cookies", "GDPR"],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex mb-4">
              <Logo size={28} withText textSize="base" />
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[28ch]">
              Build your portfolio. Find your job. Track your career.
            </p>
          </div>

          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <div className="text-[11px] font-bold text-[var(--text)] mb-4 tracking-widest uppercase">{category}</div>
              <ul className="space-y-3">
                {items.map((it) => (
                  <li key={it}>
                    <Link href="#" className="text-xs text-[var(--text-muted)] hover:text-cyan-400 transition-colors">
                      {it}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[var(--text-subtle)]">
            © {new Date().getFullYear()} myskillspage. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-[var(--text-subtle)] hover:text-cyan-400 transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-[var(--text-subtle)] hover:text-cyan-400 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
