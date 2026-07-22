import { CalendarDays, Inbox, MailOpen, MessageSquareText } from "lucide-react";

const cards = [
  {
    key: "total",
    label: "Kërkesa totale",
    icon: Inbox,
  },
  {
    key: "unread",
    label: "Të palexuara",
    icon: MailOpen,
  },
  {
    key: "today",
    label: "Sot",
    icon: MessageSquareText,
  },
  {
    key: "thisMonth",
    label: "Këtë muaj",
    icon: CalendarDays,
  },
];

export default function InquiryStats({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Icon size={20} />
            </div>

            <p className="mt-5 text-sm font-medium text-slate-500">
              {card.label}
            </p>

            <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {stats?.[card.key] ?? 0}
            </p>
          </div>
        );
      })}
    </div>
  );
}
