"use client";

import {
  useActionState,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";

const initialState = {
  success: false,
  message: "",
};

function formatMessageDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

export default function ChatThread({
  conversationId,
  messages,
  viewerType,
  sendAction,
  markReadAction,
}) {
  const router = useRouter();
  const bottomRef = useRef(null);

  const [state, formAction, pending] = useActionState(
    async (previousState, formData) => {
      const result = await sendAction(
        previousState,
        formData,
      );

      if (result?.success) {
        router.refresh();
      }

      return result;
    },
    initialState,
  );


  useEffect(() => {
    markReadAction(conversationId).catch(() => {});
  }, [conversationId, markReadAction]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 4000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="h-[58vh] min-h-[440px] overflow-y-auto bg-slate-50/80 p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((message) => {
            const mine =
              message.senderType === viewerType;

            return (
              <div
                key={message.id}
                className={`flex ${
                  mine
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    mine
                      ? "rounded-br-md bg-blue-600 text-white"
                      : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm leading-6">
                    {message.body}
                  </p>

                  <p
                    className={`mt-2 text-[11px] ${
                      mine
                        ? "text-blue-100"
                        : "text-slate-400"
                    }`}
                  >
                    {message.sender?.name ||
                      (mine ? "Ju" : "Përdorues")}
                    {" · "}
                    {formatMessageDate(
                      message.createdAt,
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>
      </div>

      <form
        action={formAction}
        className="border-t border-slate-200 p-4 sm:p-5"
      >
        <input
          type="hidden"
          name="conversationId"
          value={conversationId}
        />

        <div className="flex gap-3">
          <textarea
            name="body"
            required
            maxLength={4000}
            rows={2}
            placeholder="Shkruaj mesazhin..."
            className="min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? (
              <Loader2
                className="animate-spin"
                size={18}
              />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        {state?.message && !state.success ? (
          <p className="mt-2 text-sm font-semibold text-red-600">
            {state.message}
          </p>
        ) : null}

        <p className="mt-2 text-xs text-slate-400">
          Përditësim live çdo 4 sekonda · maksimumi
          4000 karaktere
        </p>
      </form>
    </div>
  );
}