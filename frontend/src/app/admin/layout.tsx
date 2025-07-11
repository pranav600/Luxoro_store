// app/admin/layout.tsx
import type { ReactNode } from "react";
import Navbar from "./dashboard/Navbar";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-container">
      <Navbar />
      {children}
    </div>
  );
}


