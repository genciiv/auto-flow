import "./globals.css";

import AuthSessionProvider from "@/providers/AuthSessionProvider";

export const metadata = {
  title: {
    default: "AutoFlow",
    template: "%s | AutoFlow",
  },
  description:
    "Platformë për menaxhimin e serviseve, automjeteve dhe klientëve.",
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
