import "./globals.css";

import AuthSessionProvider from "@/providers/AuthSessionProvider";
import CookieConsent from "@/components/legal/CookieConsent";
import ToastProvider from "@/components/feedback/ToastProvider";
import ConfirmProvider from "@/components/feedback/ConfirmProvider";

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
        <AuthSessionProvider>
          <ToastProvider>
            <ConfirmProvider>
              {children}
              <CookieConsent />
            </ConfirmProvider>
          </ToastProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
