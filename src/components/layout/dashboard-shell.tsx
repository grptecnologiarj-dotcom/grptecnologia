"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./dashboard-header";
import { CommandPalette } from "@/components/ui/command-palette";
import { ToastProvider } from "@/components/ui/toast";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  empresaNome?: string;
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  empresaNome,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <CommandPalette />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="lg:pl-60">
          <DashboardHeader
            userName={userName}
            userEmail={userEmail}
            empresaNome={empresaNome}
            onMenuClick={() => setSidebarOpen(true)}
          />
          <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
