"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bot,
  Grip,
  Loader2,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { askAiAssistantAction } from "@/actions/ai-assistant-actions";

const STORAGE_KEY = "autoflow.ai-launcher-position.v1";
const BUTTON_SIZE = 58;
const EDGE_GAP = 18;
const DRAG_THRESHOLD = 5;

const initialState = {
  success: false,
  message: null,
  data: null,
};

const suggestions = [
  "Cilat shërbime janë të përfunduara por të papaguara?",
  "Sa kemi arkëtuar?",
  "Cilat automjete janë gati për dorëzim?",
  "Cilat shërbime janë pa faturë?",
];

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getDefaultPosition() {
  if (typeof window === "undefined") {
    return { x: EDGE_GAP, y: EDGE_GAP };
  }

  return {
    x: Math.max(EDGE_GAP, window.innerWidth - BUTTON_SIZE - 28),
    y: Math.max(EDGE_GAP, window.innerHeight - BUTTON_SIZE - 28),
  };
}

function clampPosition(position) {
  if (typeof window === "undefined") return position;

  return {
    x: clamp(
      position.x,
      EDGE_GAP,
      Math.max(EDGE_GAP, window.innerWidth - BUTTON_SIZE - EDGE_GAP),
    ),
    y: clamp(
      position.y,
      EDGE_GAP,
      Math.max(EDGE_GAP, window.innerHeight - BUTTON_SIZE - EDGE_GAP),
    ),
  };
}

function loadPosition() {
  const fallback = getDefaultPosition();

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored);
    if (!Number.isFinite(parsed?.x) || !Number.isFinite(parsed?.y)) {
      return fallback;
    }

    return clampPosition(parsed);
  } catch {
    return fallback;
  }
}

function savePosition(position) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  } catch {
    // The launcher still works when storage is unavailable.
  }
}

export default function AiAssistantWidget() {
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const formRef = useRef(null);
  const dragRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState({ x: EDGE_GAP, y: EDGE_GAP });
  const [state, formAction, pending] = useActionState(
    askAiAssistantAction,
    initialState,
  );

  useEffect(() => {
    const animationFrame = window.requestAnimationFrame(() => {
      setPosition(loadPosition());
      setReady(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, []);

  useEffect(() => {
    function handleResize() {
      setPosition((current) => {
        const next = clampPosition(current);
        savePosition(next);
        return next;
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success, state.requestId]);

  function handlePointerDown(event) {
    if (event.button !== 0) return;

    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: position.x,
      startY: position.y,
      moved: false,
    };
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startClientX;
    const deltaY = event.clientY - drag.startClientY;

    if (
      Math.abs(deltaX) > DRAG_THRESHOLD ||
      Math.abs(deltaY) > DRAG_THRESHOLD
    ) {
      drag.moved = true;
    }

    if (!drag.moved) return;

    event.preventDefault();
    setPosition(
      clampPosition({
        x: drag.startX + deltaX,
        y: drag.startY + deltaY,
      }),
    );
  }

  function finishDrag(event) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragRef.current = null;

    if (drag.moved) {
      const next = clampPosition(position);
      setPosition(next);
      savePosition(next);
      return;
    }

    setOpen((current) => !current);
  }

  function applySuggestion(question) {
    if (!inputRef.current) return;
    inputRef.current.value = question;
    inputRef.current.focus();
  }

  const launcherStyle = ready
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
      }
    : {
        right: "28px",
        bottom: "28px",
      };

  return (
    <>
      {open ? (
        <section
          aria-label="AutoFlow AI"
          className={`fixed z-[70] overflow-hidden border border-slate-200 bg-white shadow-2xl transition-all ${
            expanded
              ? "inset-4 rounded-[2rem] sm:inset-8 lg:left-auto lg:w-[720px]"
              : "bottom-24 right-4 h-[min(680px,calc(100vh-8rem))] w-[calc(100vw-2rem)] rounded-[2rem] sm:right-6 sm:w-[430px]"
          }`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <Bot size={21} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold">AutoFlow AI</p>
                <p className="truncate text-xs text-slate-300">
                  Pyet për servisin, faturat dhe pagesat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setExpanded((current) => !current)}
                aria-label={expanded ? "Zvogëlo chat-in" : "Zmadho chat-in"}
                className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white sm:flex"
              >
                {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Mbyll chat-in AI"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(100%-73px)] flex-col">
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-5">
              {state.data ? (
                <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700">
                    <Sparkles size={17} />
                    <p className="font-semibold">{state.data.title}</p>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {state.data.answer}
                  </p>
                  {state.data.items?.length ? (
                    <ul className="mt-4 space-y-2">
                      {state.data.items.map((item) => (
                        <li
                          key={item}
                          className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-56 flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600">
                    <Sparkles size={25} />
                  </div>
                  <p className="mt-4 font-semibold text-slate-900">
                    Si mund të të ndihmoj?
                  </p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Përgjigjet bazohen vetëm te të dhënat e biznesit aktiv dhe
                    lejet e përdoruesit.
                  </p>
                </div>
              )}

              <div className="mt-4 grid gap-2">
                {suggestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => applySuggestion(question)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm leading-5 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <form
              ref={formRef}
              action={formAction}
              className="border-t border-slate-200 bg-white p-4"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  name="question"
                  required
                  maxLength={500}
                  rows={2}
                  placeholder="Shkruaj pyetjen..."
                  className="min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="submit"
                  disabled={pending}
                  aria-label="Dërgo pyetjen"
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
              {!state.success && state.message ? (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {state.message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        aria-label={open ? "Mbyll AutoFlow AI" : "Hap AutoFlow AI"}
        title="Zvarrite për ta pozicionuar · Kliko për ta hapur"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        style={launcherStyle}
        className="fixed z-[80] flex h-[58px] w-[58px] touch-none select-none items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl ring-4 ring-white/80 transition hover:bg-blue-700 focus:outline-none focus:ring-blue-300"
      >
        <Bot size={25} />
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-white shadow-sm">
          <Grip size={11} />
        </span>
      </button>
    </>
  );
}
