import type { ReactNode } from "react";

// Auth pages (login/register) handle their own full-page layouts
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
