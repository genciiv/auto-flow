"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export const landingNavigationItems = [
  { label: "Platforma", targetId: "platform" },
  { label: "Si funksionon", targetId: "how-it-works" },
  { label: "Funksionet", targetId: "features" },
  { label: "Çmimet", targetId: "pricing" },
  { label: "Pyetje", targetId: "faq" },
];

export function scrollToLandingSection(targetId, router) {
  const element = document.getElementById(targetId);

  if (!element) {
    router?.push(`/#${targetId}`);
    return;
  }

  const headerOffset = 84;
  const elementTop = element.getBoundingClientRect().top + window.scrollY;

  window.history.replaceState(null, "", `/#${targetId}`);

  window.scrollTo({
    top: Math.max(elementTop - headerOffset, 0),
    behavior: "smooth",
  });
}

export default function LandingNavigationLinks() {
  const router = useRouter();

  return (
    <>
      {landingNavigationItems.map((item) =>
        item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {item.label}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={() => scrollToLandingSection(item.targetId, router)}
            className="rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
          >
            {item.label}
          </button>
        ),
      )}
    </>
  );
}
