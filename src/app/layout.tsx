import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";

export const metadata: Metadata = {
  title: "Candy Water Admin Dashboard",
  description: "لوحة تحكم إدارية لتطبيق Candy Water",
  icons: {
    icon: '/icon/iconApp.png',
    apple: '/icon/iconApp.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/icon/iconApp.png" />
        <link rel="apple-touch-icon" href="/icon/iconApp.png" />
      </head>
      <body className="bg-gradient-to-br from-blue-50 via-white to-purple-50 font-sans">
        <AuthProvider>
          <DataProvider>
            {children}
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
