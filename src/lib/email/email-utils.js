export function buildSubject(subject) {
  return `[AutoFlow] ${subject}`;
}

export function buildGreeting(name) {
  if (!name) {
    return "Përshëndetje,";
  }

  return `Përshëndetje ${name},`;
}
