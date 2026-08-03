# AutoFlow — Kalendari i avancuar i termineve

## Funksionet e shtuara

- Pamje ditore, javore dhe mujore.
- Filtrim sipas statusit dhe punonjësit/mekanikut.
- Caktim i punonjësit dhe kohëzgjatjes së terminit.
- Statuset: PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW.
- Riplanifikim drag-and-drop duke ruajtur orën ekzistuese.
- Lidhje një-me-një mes terminit dhe urdhër-punës së krijuar.
- Ruajtje e konfirmimit të klientit dhe gjendjes së reminder-it.
- Kontroll server-side që punonjësi i caktuar i përket biznesit aktiv.

## Migration

`20260803143000_advanced_appointments_calendar`

Migration-i krijon `AppointmentStatus`, shton punonjësin e caktuar, kohëzgjatjen, lidhjen me servisin, konfirmimin, reminder-in dhe arsyen e anulimit.
