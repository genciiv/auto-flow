# AutoFlow — Subscription Plans Configuration

Ky konfigurim përdor Lekë shqiptare (ALL), bashkon Starter dhe Professional në një paketë të vetme dhe e vendos Free Trial në 7 ditë.

## Planet aktive

### Free Trial — 7 ditë

- 0 Lekë.
- 5 përdorues.
- 1,000 klientë.
- 2,000 automjete.
- Menaxhim klientësh.
- Menaxhim automjetesh.
- Regjistrim të punëve të servisit.
- Takime dhe rezervime.
- Krijim faturash.

### Professional — 3,900 Lekë/muaj

- 39,000 Lekë/vit.
- 7 përdorues.
- 1,000 klientë.
- 2,000 automjete.
- Menaxhim klientësh.
- Menaxhim automjetesh.
- Regjistrim të punëve të servisit.
- Takime dhe rezervime.
- Krijim faturash.

### Premium Business — 6,900 Lekë/muaj

- 69,000 Lekë/vit.
- 20 përdorues.
- Klientë pa kufi.
- Automjete pa kufi.
- Të gjitha funksionet e Professional.
- Inventar dhe stok.
- Blerje dhe furnitorë.
- Marketplace.
- Analytics dhe raporte të avancuara.
- Eksporte.
- Audit logs.
- Role dhe leje për stafin.
- Listime të promovuara.
- Mbështetje prioritare.

## Plani i vjetër Starter

Plani me slug `starter` çaktivizohet, por nuk fshihet. Kjo ruan historikun dhe lidhjet e abonimeve ekzistuese.

## Aplikimi në databazë

```powershell
npm run plans:configure
```

Komanda përdor `upsert`, nuk krijon dublikatë dhe vendos monedhën e platformës në `ALL`.
