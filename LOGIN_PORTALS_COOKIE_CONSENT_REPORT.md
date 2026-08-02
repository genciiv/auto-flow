# AutoFlow — Login Portals & Cookie Consent

## Cookie consent

- Zgjedhja ruhet në `localStorage` dhe në cookie fallback për 1 vit.
- Banner-i nuk shfaqet përsëri në të njëjtin browser/pajisje.
- Banner-i shfaqet sërish vetëm pas pastrimit të browser-it, përdorimit të butonit “Cilësimet e cookies”, ose ndryshimit të versionit të politikës.

## Login Personal

- Lejohet vetëm për përdorues me `globalRole: CUSTOMER`.
- Ridrejton te `/customer/dashboard`.

## Login Biznes

- Lejohet për `PLATFORM_ADMIN` ose përdorues me të paktën një `BusinessUser` aktiv.
- Platform admin ridrejtohet te `/admin`.
- Pronari dhe stafi ridrejtohen te `/dashboard`.

## Struktura

Nuk është shtuar tabelë e re. Të dy portalet përdorin të njëjtin model `User`; aksesi verifikohet server-side sipas `globalRole` dhe memberships aktive.
