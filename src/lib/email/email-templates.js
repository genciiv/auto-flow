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

<p>${buttonUrl}</p>

<hr>

<p style="font-size:12px;color:#666">
AutoFlow
</p>

</div>
`;
}
