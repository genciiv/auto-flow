import { signInWithGoogle } from "@/app/auth/social-actions";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0">
      <path fill="#4285F4" d="M21.35 12.18c0-.74-.07-1.46-.2-2.14H12v4.05h5.23a4.47 4.47 0 0 1-1.94 2.93v2.63h3.14c1.84-1.69 2.92-4.19 2.92-7.47Z" />
      <path fill="#34A853" d="M12 21.67c2.63 0 4.83-.87 6.43-2.36l-3.14-2.63c-.87.58-1.98.93-3.29.93-2.54 0-4.7-1.72-5.47-4.03H3.29v2.71A9.72 9.72 0 0 0 12 21.67Z" />
      <path fill="#FBBC05" d="M6.53 13.58A5.85 5.85 0 0 1 6.22 12c0-.55.1-1.08.31-1.58V7.71H3.29A9.72 9.72 0 0 0 2.33 12c0 1.56.37 3.03.96 4.29l3.24-2.71Z" />
      <path fill="#EA4335" d="M12 6.39c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.37 9.37 0 0 0 12 2.33a9.72 9.72 0 0 0-8.71 5.38l3.24 2.71C7.3 8.11 9.46 6.39 12 6.39Z" />
    </svg>
  );
}

export default function GoogleAuthButton({ label = "Vazhdo me Google" }) {
  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100"
      >
        <GoogleMark />
        <span>{label}</span>
      </button>
    </form>
  );
}
