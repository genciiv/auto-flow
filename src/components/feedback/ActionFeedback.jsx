"use client";

import { useEffect, useRef } from "react";
import { useToast } from "./ToastProvider";

export default function ActionFeedback({ state, successTitle, errorTitle }) {
  const toast = useToast();
  const previous = useRef(state);

  useEffect(() => {
    if (!state || state === previous.current || !state.message) return;
    previous.current = state;
    if (state.success) toast.success(state.message, successTitle);
    else toast.error(state.message || state.error, errorTitle);
  }, [state, successTitle, errorTitle, toast]);

  return null;
}
