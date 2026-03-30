import Link from "next/link";
import { Logo } from "@/components/logo";

const links = {
  Product: ["Features", "Templates", "Pricing", "Changelog"],
  Resources: ["Blog", "Documentation", "API Reference", "Status"],
  Company: ["About", "Careers", "Press", "Contact"],
  Legal: ["Privacy", "Terms", "Cookies", "GDPR"],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 bg-zinc-50">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex mb-4">
              <Logo size={26} withText textClassName="text-zinc-950 text-sm" />
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-[28ch]">
              Build your portfolio. Find your job. Track your career.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <div className="text-xs font-semibold text-zinc-950 mb-4">{category}</div>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-xs text-zinc-500 hover:text-zinc-950 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-zinc-200 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-400">
            {new Date().getFullYear()} myskillspage. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">Privacy</Link>
            <Link href="#" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
