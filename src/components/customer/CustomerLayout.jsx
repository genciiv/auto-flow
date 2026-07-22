"use client";

import { useState } from "react";

import CustomerSidebar from "@/components/customer/CustomerSidebar";
import CustomerTopbar from "@/components/customer/CustomerTopbar";

export default function CustomerLayout({
  children,
  userName,
  userEmail,
  favoriteCount = 0,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <CustomerSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userEmail={userEmail}
      />

      <div className="min-h-screen lg:pl-72">
        <CustomerTopbar
          userName={userName}
          favoriteCount={favoriteCount}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
