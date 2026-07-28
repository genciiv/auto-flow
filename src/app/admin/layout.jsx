import "./globals.css";

import AuthSessionProvider from "@/providers/AuthSessionProvider";

export const metadata = {
  title: {
    default: "AutoFlow",
    template: "%s | AutoFlow",
  },
  description:
    "Platformë moderne për menaxhimin e serviseve, automjeteve, klientëve dhe marketplace-it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sq">
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
