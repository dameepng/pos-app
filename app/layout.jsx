import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "POS App",
  icons: {
    icon: "/logopos.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-zinc-50 text-zinc-900">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
