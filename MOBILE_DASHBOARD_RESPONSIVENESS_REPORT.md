# AutoFlow Mobile Dashboard Responsiveness

## Scope

U përmirësuan shell-et responsive për tre zonat kryesore të platformës:

- Platform Admin
- Business Dashboard
- Customer Portal (u ruajt implementimi ekzistues responsive)

## Ndryshimet kryesore

- Sidebar mobile me drawer, overlay dhe buton mbylljeje.
- Buton hamburger në topbar për Admin dhe Business Dashboard.
- Mbyllje automatike e sidebar-it pas navigimit.
- Topbar më kompakt në mobile dhe me lartësi responsive.
- Search i aksesueshëm edhe në mobile përmes butonit me ikonë.
- Profile dhe notification controls ruhen pa overflow.
- Padding i përmbajtjes u reduktua në mobile dhe ruhet spacing-u desktop.
- Sidebar desktop vazhdon të jetë fixed nga breakpoint `lg`.

## File-t kryesorë

- `src/components/dashboard/DashboardShell.jsx`
- `src/components/dashboard/DashboardLayout.jsx`
- `src/components/dashboard/Sidebar.jsx`
- `src/components/dashboard/SidebarGroup.jsx`
- `src/components/dashboard/Topbar.jsx`
- `src/components/dashboard/SearchCommand.jsx`
- `src/components/admin/AdminShell.jsx`
- `src/components/admin/AdminSidebar.jsx`
- `src/components/admin/AdminTopbar.jsx`
- `src/app/admin/layout.jsx`

## Breakpoints e synuara

- Mobile: 320px–639px
- Tablet: 640px–1023px
- Desktop: 1024px+

## Verifikimi lokal

Pas kopjimit të projektit:

```powershell
npm install
npm run lint
npm run build
```

Pastaj kontrollo DevTools në gjerësi 320px, 375px, 430px, 768px dhe 1024px.
