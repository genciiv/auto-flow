import Link from "next/link";

import { authTokenService } from "@/lib/auth-tokens";

const ERROR_MESSAGES = {
  NOT_FOUND: "Linku i verifikimit nuk është i vlefshëm.",
  USER_DISABLED: "Kjo llogari është çaktivizuar.",
  REVOKED: "Ky link verifikimi është anuluar.",
  USED: "Ky link verifikimi është përdorur më parë.",
  EXPIRED: "Linku i verifikimit ka skaduar.",
  ALREADY_PROCESSED: "Ky link është përpunuar më parë.",
};

export default async function VerifyEmailPage({ searchParams }) {
  const params = await searchParams;
  const token = typeof params?.token === "string" ? params.token : "";

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Link i pavlefshëm</h1>

          <p className="mt-3 text-gray-600">Token-i i verifikimit mungon.</p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Shko te hyrja
          </Link>
        </div>
      </main>
    );
  }

  const result = await authTokenService.verifyEmailAndConsume(token);

  if (!result.valid) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Verifikimi dështoi</h1>

          <p className="mt-3 text-gray-600">
            {ERROR_MESSAGES[result.reason] ??
              "Email-i nuk mund të verifikohej."}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            Shko te hyrja
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">✓</div>

        <h1 className="mt-4 text-2xl font-semibold">Email-i u verifikua</h1>

        <p className="mt-3 text-gray-600">
          Llogaria jote është verifikuar me sukses. Tani mund të hysh në
          AutoFlow.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
        >
          Hyr në llogari
        </Link>
      </div>
    </main>
  );
}
