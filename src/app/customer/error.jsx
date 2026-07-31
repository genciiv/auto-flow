"use client";

import ErrorState from "@/components/feedback/ErrorState";

export default function Error({ reset }) {
  return <ErrorState title="Zona nuk mund të ngarkohej" description="Ndodhi një gabim gjatë ngarkimit të kësaj pjese të AutoFlow." reset={reset} />;
}
