export default function FieldError({ id, message }) {
  const text = Array.isArray(message) ? message[0] : message;
  if (!text) return null;
  return <p id={id} role="alert" className="mt-1.5 text-xs font-semibold text-red-600">{text}</p>;
}
