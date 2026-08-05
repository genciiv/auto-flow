"use server";

import { z } from "zod";

import {
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import {
  answerAiAssistantQuestion,
  getAiAssistantSnapshot,
} from "@/lib/ai-assistant-context";
import { requireBusinessActionPermission } from "@/lib/business-context";
import { PERMISSIONS } from "@/lib/permissions";
import { validateObject } from "@/lib/validation";

const questionSchema = z.object({
  question: z
    .string()
    .trim()
    .min(2, "Shkruaj një pyetje më të plotë.")
    .max(500, "Pyetja është shumë e gjatë."),
});

export async function askAiAssistantAction(_previousState, formData) {
  try {
    const context = await requireBusinessActionPermission(
      PERMISSIONS.AI_ASSISTANT_USE,
    );
    const validation = validateObject(questionSchema, {
      question: formData.get("question"),
    });

    if (!validation.success) {
      return validationFailure(validation.error);
    }

    const snapshot = await getAiAssistantSnapshot({
      businessId: context.businessId,
    });
    const result = answerAiAssistantQuestion({
      question: validation.data.question,
      snapshot,
    });

    return actionSuccess({
      message: "Përgjigjja u përgatit.",
      data: result,
    });
  } catch (error) {
    return errorFailure(error, {
      fallbackMessage: "Asistenti nuk mundi ta përpunonte pyetjen.",
    });
  }
}
