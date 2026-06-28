import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-canvas-parchment">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 sm:px-8">
        {children}
      </div>
    </main>
  );
}
