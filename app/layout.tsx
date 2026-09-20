import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { FinanceProvider } from "@/lib/store";
import Navbar from "@/components/Navbar";
import FinanceChatbot from "@/components/FinanceChatbot";
import AuthGate from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Tania — Financial Tracker & Planner",
  description: "Financial tracker & planner pribadi Tania: income, expenses, cash flow, saving, dan investment.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <FinanceProvider>
            <div className="app-shell">
              <Navbar />
              <main className="container">
                <AuthGate>{children}</AuthGate>
              </main>
              <footer className="footer">
                Dibuat dengan 💙 untuk <b>Tania</b> • Income · Expenses · Cash Flow · Saving · Investment
              </footer>
              <FinanceChatbot />
            </div>
          </FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
