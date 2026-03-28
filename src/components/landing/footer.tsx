import Link from "next/link";

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
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="2" width="6" height="6" rx="1" fill="white" />
                  <rect x="10" y="2" width="6" height="6" rx="1" fill="white" fillOpacity="0.4" />
                  <rect x="2" y="10" width="6" height="6" rx="1" fill="white" fillOpacity="0.4" />
                  <rect x="10" y="10" width="6" height="6" rx="1" fill="#22c55e" />
                </svg>
              </div>
              <span className="font-semibold text-zinc-950 tracking-tight text-sm">Showup</span>
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
            {new Date().getFullYear()} Showup. All rights reserved.
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
