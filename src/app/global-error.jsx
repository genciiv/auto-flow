"use client";

import ErrorState from "@/components/feedback/ErrorState";

export default function GlobalError({ reset }) {
  return <html lang="sq"><body><ErrorState title="AutoFlow hasi një problem" description="Ndodhi një gabim i papritur në aplikacion. Të dhënat e tua nuk janë humbur." reset={reset} /></body></html>;
}
