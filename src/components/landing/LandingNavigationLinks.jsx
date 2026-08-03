"use client";

import Link from "next/link";

export const landingNavigationItems = [
  {
    label: "Platforma",
    targetId: "platform",
  },
  {
    label: "Si funksionon",
    targetId: "how-it-works",
  },
  {
    label: "Funksionet",
    targetId: "features",
  },
  {
    label: "Çmimet",
    targetId: "pricing",
  },
  {
    label: "Pyetje",
    targetId: "faq",
  },
];

export function scrollToLandingSection(targetId) {
  const element = document.getElementById(targetId);

  if (!element) {
    window.location.assign(`/#${targetId}`);
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
  return (
    <>
      {landingNavigationItems.map((item) =>
        item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"
          >
            {item.label}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            onClick={() => scrollToLandingSection(item.targetId)}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-600 transition duration-200 hover:bg-white hover:text-slate-950 hover:shadow-sm"
          >
            {item.label}
          </button>
        ),
      )}
    </>
  );
}
