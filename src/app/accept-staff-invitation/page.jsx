import Link from "next/link";
import { auth } from "@/auth";
import { acceptInvitationAction } from "./actions";

export default async function AcceptStaffInvitationPage({ searchParams }) {
  const { token = "" } = await searchParams;
  const session = await auth();
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4"><div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"><p className="text-sm font-bold uppercase tracking-[.18em] text-blue-600">AutoFlow</p><h1 className="mt-3 text-2xl font-bold text-slate-950">Prano ftesën e stafit</h1><p className="mt-3 text-sm leading-6 text-slate-600">{session?.user?.email?`Je futur si ${session.user.email}. Prano ftesën për t'u bashkuar me biznesin.`:"Duhet të hysh ose të regjistrohesh me email-in ku erdhi ftesa."}</p>{session?.user?.id?<form action={acceptInvitationAction} className="mt-6"><input type="hidden" name="token" value={token}/><button className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">Prano ftesën</button></form>:<div className="mt-6 grid gap-3"><Link href={`/login?callbackUrl=${encodeURIComponent(`/accept-staff-invitation?token=${token}`)}`} className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold text-white">Hyr në llogari</Link><Link href="/register" className="rounded-xl border border-slate-200 px-5 py-3 text-center font-semibold text-slate-700">Krijo llogari</Link></div>}</div></main>;
}
