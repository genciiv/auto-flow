# AutoFlow — Njoftime dhe reminders operative

## Përmbledhje

Ky version shton njoftime individuale sipas rolit dhe reminders ditore pa ndryshuar skemën e databazës.

## Ngjarjet e mbuluara

- Mekaniku njoftohet kur i caktohet një urdhër-punë.
- Pronari, menaxheri dhe magazinieri njoftohen kur puna kalon në `WAITING_FOR_PARTS`.
- Pronari, menaxheri dhe recepsionisti njoftohen kur puna kalon në `READY_FOR_PICKUP`.
- Pronari, menaxheri dhe magazinieri njoftohen kur një pjesë bie në ose nën minimumin e stokut.
- Pronari, menaxheri dhe financieri njoftohen kur regjistrohet pagesë e pjesshme.
- Pronari, menaxheri dhe recepsionisti marrin reminder për terminet e ditës.
- Pronari, menaxheri dhe financieri marrin reminder për faturat e papaguara mbi 7 ditë.
- Pronari, menaxheri dhe magazinieri marrin reminder ditor për stokun nën minimum.

## Zilja e biznesit

Zilja bashkon:

- njoftimet e përgjithshme të biznesit;
- njoftimet individuale të përdoruesit;
- kërkesat e Marketplace;
- kërkesat për lidhjen e automjetit.

Njoftimet individuale shënohen si të lexuara vetëm për përdoruesin përkatës. Njoftimet e përgjithshme vazhdojnë të përdorin scope-in e biznesit.

## Lidhjet direkte

- Shërbim → `/dashboard/services/[id]`
- Termin → `/dashboard/appointments`
- Pagesë/faturë → `/dashboard/invoices/[id]`
- Stok → `/dashboard/inventory`
- Abonim → `/dashboard/settings/subscription`

## Idempotenca e reminders

Reminder-at ditore kontrollojnë nëse një njoftim me të njëjtin përdorues, titull, entity dhe datë ekziston tashmë. Kjo shmang dublikimet gjatë rifreskimit të dashboard-it.

## Migration

Nuk kërkohet migration i ri. Modeli ekzistues `Notification` mbështet si `businessId`, ashtu edhe `userId`.
