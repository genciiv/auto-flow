import { buildGreeting } from "./email-utils";

export function emailLayout({ name, title, content, buttonText, buttonUrl }) {
  return `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px">

<h2>${title}</h2>

<p>${buildGreeting(name)}</p>

<p>${content}</p>

<p style="margin:32px 0">
<a
href="${buttonUrl}"
style="
background:#2563eb;
color:white;
padding:14px 22px;
text-decoration:none;
border-radius:8px;
display:inline-block;
">
${buttonText}
</a>
</p>

<p>
Nëse nuk funksionon butoni, kopjo këtë link:
</p>

<p style="word-break:break-all">${buttonUrl}</p>

<hr>

<p style="font-size:12px;color:#666">
AutoFlow
</p>

</div>
`;
}

export function emailVerificationTemplate({ name, verificationUrl }) {
  return emailLayout({
    name,
    title: "Verifiko adresën tënde të email-it",
    content: `
      Faleminderit që u regjistrove në AutoFlow.
      Kliko butonin më poshtë për të verifikuar adresën tënde të email-it.
      Linku është i vlefshëm për 24 orë.
    `,
    buttonText: "Verifiko email-in",
    buttonUrl: verificationUrl,
  });
}

export function passwordResetTemplate({ name, resetPasswordUrl }) {
  return emailLayout({
    name,
    title: "Rivendos password-in",
    content: `
      Kemi marrë një kërkesë për ndryshimin e password-it të llogarisë
      tënde AutoFlow. Kliko butonin më poshtë për të vendosur një
      password të ri. Linku është i vlefshëm për 1 orë.
      Nëse nuk e ke bërë ti këtë kërkesë, mund ta injorosh këtë email.
    `,
    buttonText: "Vendos password të ri",
    buttonUrl: resetPasswordUrl,
  });
}

export function passwordChangedTemplate({ name, loginUrl }) {
  return emailLayout({
    name,
    title: "Password-i u ndryshua",
    content: `
      Password-i i llogarisë tënde AutoFlow u ndryshua me sukses.
      Nëse e ke bërë ti këtë ndryshim, nuk kërkohet asnjë veprim tjetër.
      Nëse nuk e njeh këtë veprim, kontakto menjëherë mbështetjen e AutoFlow
      dhe kërko rivendosjen e llogarisë.
    `,
    buttonText: "Hap AutoFlow",
    buttonUrl: loginUrl,
  });
}

export function emailChangeVerificationTemplate({
  name,
  newEmail,
  verificationUrl,
}) {
  return emailLayout({
    name,
    title: "Konfirmo email-in e ri",
    content: `
      Kemi marrë një kërkesë për ndryshimin e email-it të llogarisë
      tënde AutoFlow në <strong>${newEmail}</strong>.
      Kliko butonin më poshtë për ta konfirmuar.
      Linku është i vlefshëm për 1 orë.
      Nëse nuk e ke bërë ti këtë kërkesë, mos e hap linkun.
    `,
    buttonText: "Konfirmo email-in e ri",
    buttonUrl: verificationUrl,
  });
}

export function emailChangedSecurityTemplate({ name, newEmail, loginUrl }) {
  return emailLayout({
    name,
    title: "Email-i i llogarisë u ndryshua",
    content: `
      Email-i i llogarisë tënde AutoFlow u ndryshua në
      <strong>${newEmail}</strong>.
      Të gjitha sesionet e mëparshme janë çaktivizuar.
      Nëse nuk e njeh këtë ndryshim, kontakto menjëherë
      mbështetjen e AutoFlow.
    `,
    buttonText: "Hap AutoFlow",
    buttonUrl: loginUrl,
  });
}

export function accountActivationTemplate({
  name,
  businessName,
  activationUrl,
}) {
  return emailLayout({
    name,
    title: "Aktivizo llogarinë tënde AutoFlow",
    content: `
      Aplikimi për biznesin <strong>${businessName}</strong>
      u aprovua me sukses.

      Kliko butonin më poshtë për të vendosur password-in dhe
      për të aktivizuar llogarinë e pronarit.

      Linku është i vlefshëm për 48 orë.
    `,
    buttonText: "Aktivizo llogarinë",
    buttonUrl: activationUrl,
  });
}

export function businessApprovedTemplate({ name, businessName, dashboardUrl }) {
  return emailLayout({
    name,
    title: "Biznesi yt u aprovua",
    content: `
      Aplikimi për biznesin <strong>${businessName}</strong>
      u aprovua dhe biznesi u lidh me llogarinë tënde ekzistuese.

      Mund të hysh në AutoFlow me email-in dhe password-in aktual.
    `,
    buttonText: "Hap AutoFlow",
    buttonUrl: dashboardUrl,
  });
}
