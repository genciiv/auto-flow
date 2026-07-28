import Link from "next/link";
import { CheckCircle2, MailCheck, XCircle } from "lucide-react";

import { authTokenService } from "@/lib/auth-tokens";
import {
  EMAIL_CONFIG,
  emailChangedSecurityTemplate,
  sendEmail,
} from "@/lib/email";

const ERROR_MESSAGES = {
  NOT_FOUND: "Linku nuk është i vlefshëm.",
  USER_DISABLED: "Kjo llogari është çaktivizuar.",
  REVOKED: "Ky link është anuluar.",
  USED: "Ky link është përdorur më parë.",
  EXPIRED: "Linku ka skaduar.",
  ALREADY_PROCESSED: "Ky link është përpunuar më parë.",
  INVALID_METADATA: "Të dhënat e linkut nuk janë të vlefshme.",
  EMAIL_TAKEN: "Email-i i ri po përdoret tashmë nga një llogari tjetër.",
};

export const metadata = {
  title: "Konfirmo email-in e ri | AutoFlow",
};

export default async function VerifyEmailChangePage({ searchParams }) {
  const params = await searchParams;

  const token = typeof params?.token === "string" ? params.token.trim() : "";

  if (!token) {
    return (
      <ResultCard
        success={false}
        message="Token-i i ndryshimit të email-it mungon."
      />
    );
  }

  const result = await authTokenService.changeEmailAndConsume(token);

  if (!result.valid) {
    return (
      <ResultCard
        success={false}
        message={
          ERROR_MESSAGES[result.reason] ?? "Email-i nuk mund të ndryshohej."
        }
      />
    );
  }

  try {
    const html = emailChangedSecurityTemplate({
      name: result.user.name,
      newEmail: result.newEmail,
      loginUrl: `${EMAIL_CONFIG.appUrl}/login`,
    });

    await sendEmail({
      to: result.oldEmail,
      subject: "Email-i i llogarisë u ndryshua",
      html,
    });
  } catch (error) {
    console.warn(
      "Email-i u ndryshua, por njoftimi te email-i i vjetër nuk u dërgua:",
      error?.message,
    );
  }

  return (
    <ResultCard
      success
      message={`Email-i u ndryshua me sukses në ${result.newEmail}. Hyr përsëri në llogari.`}
    />
  );
}

function ResultCard({ success, message }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div
          className={`mx-auto flex size-14 items-center justify-center rounded-2xl ${
            success
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-600"
          }`}
        >
          {success ? (
            <CheckCircle2 className="size-7" />
          ) : (
            <XCircle className="size-7" />
          )}
        </div>

        <MailCheck className="mx-auto mt-6 size-6 text-slate-400" />

        <h1 className="mt-4 text-2xl font-bold text-slate-950">
          {success ? "Email-i u ndryshua" : "Ndryshimi dështoi"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>

        <Link
          href="/login"
          className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-blue-600"
        >
          Shko te hyrja
        </Link>
      </div>
    </main>
  );
}
