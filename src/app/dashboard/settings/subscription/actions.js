"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionFailure,
  actionSuccess,
  errorFailure,
  validationFailure,
} from "@/lib/action-result";
import { requireBusinessPermission } from "@/lib/business-context";
import { db } from "@/lib/db";
import { EMAIL_CONFIG, sendEmail } from "@/lib/email";
import { ERROR_CODES, logServerError } from "@/lib/errors";
import { PERMISSIONS } from "@/lib/permissions";
import { validateFormData } from "@/lib/validation";
import { createBusinessNotification } from "@/services/notification-service";

const requestSubscriptionPlanSchema = z.object({
  planId: z.string().trim().min(1, "Plani i zgjedhur nuk është i vlefshëm."),
});

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatLek(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export async function requestSubscriptionPlanAction(previousState, formData) {
  const validationResult = validateFormData(
    requestSubscriptionPlanSchema,
    formData,
  );

  if (!validationResult.success) {
    return validationFailure(validationResult.error, {
      message: "Plani i zgjedhur nuk është i vlefshëm.",
    });
  }

  const { planId } = validationResult.data;

  try {
    const { businessId, business, user } = await requireBusinessPermission(
      PERMISSIONS.BILLING_MANAGE,
    );

    const [requestedPlan, currentSubscription, existingRequest] =
      await Promise.all([
        db.plan.findFirst({
          where: {
            id: planId,
            isActive: true,
            slug: {
              not: "free-trial",
            },
          },
          select: {
            id: true,
            name: true,
            monthlyPrice: true,
            yearlyPrice: true,
          },
        }),

        db.subscription.findFirst({
          where: {
            businessId,
          },
          orderBy: {
            createdAt: "desc",
          },
          select: {
            planId: true,
            plan: {
              select: {
                name: true,
              },
            },
          },
        }),

        db.subscriptionPlanRequest.findFirst({
          where: {
            businessId,
            requestedPlanId: planId,
            status: { in: ["PENDING", "APPROVED"] },
          },
          select: {
            id: true,
            status: true,
          },
        }),
      ]);

    if (!requestedPlan) {
      return actionFailure({
        code: ERROR_CODES.NOT_FOUND,
        message: "Plani i zgjedhur nuk ekziston ose nuk është aktiv.",
      });
    }

    if (currentSubscription?.planId === requestedPlan.id) {
      return actionFailure({
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Ky është tashmë plani aktual i biznesit.",
      });
    }

    if (existingRequest) {
      return actionFailure({
        code: ERROR_CODES.VALIDATION_ERROR,
        message:
          "Ekziston tashmë një kërkesë aktive për këtë plan. Prit shqyrtimin nga administratori.",
      });
    }

    const currentPlanName = currentSubscription?.plan?.name || "Pa plan aktiv";

    const request = await db.subscriptionPlanRequest.create({
      data: {
        businessId,
        requestedPlanId: requestedPlan.id,
        requestedById: user.id,
        requestedPrice: Number(requestedPlan.monthlyPrice || 0),
        billingInterval: "MONTHLY",
        currentPlanName,
      },
    });

    await createBusinessNotification({
      businessId,
      title: "Kërkesa për ndryshim plani u regjistrua",
      message:
        `Kërkesa për planin ${requestedPlan.name} ` +
        "po pret shqyrtimin e administratorit.",
      type: "INFO",
      entityType: "SUBSCRIPTION",
      entityId: request.id,
    });

    const supportEmail = EMAIL_CONFIG.replyTo;

    if (supportEmail) {
      const businessName = business?.name || "Biznes AutoFlow";

      const requesterName = user?.name || user?.email || "Përdorues biznesi";

      const requesterEmail = user?.email || "Nuk disponohet";

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:32px">
          <h2>Kërkesë e re për ndryshim plani</h2>

          <p>
            Kërkesa u ruajt në panelin Admin të AutoFlow.
          </p>

          <table
            style="
              width:100%;
              border-collapse:collapse;
              margin-top:24px;
            "
          >
            <tr>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                <strong>Biznesi</strong>
              </td>

              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                ${escapeHtml(businessName)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                <strong>Kërkuesi</strong>
              </td>

              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                ${escapeHtml(requesterName)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                <strong>Email</strong>
              </td>

              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                ${escapeHtml(requesterEmail)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                <strong>Plani aktual</strong>
              </td>

              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                ${escapeHtml(currentPlanName)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                <strong>Plani i kërkuar</strong>
              </td>

              <td style="padding:10px;border-bottom:1px solid #e5e7eb">
                ${escapeHtml(requestedPlan.name)}
              </td>
            </tr>

            <tr>
              <td style="padding:10px">
                <strong>Çmimi mujor</strong>
              </td>

              <td style="padding:10px">
                ${escapeHtml(formatLek(requestedPlan.monthlyPrice))}
              </td>
            </tr>
          </table>

          <p style="margin-top:24px">
            Hape panelin Admin → Kërkesat e planeve.
          </p>
        </div>
      `;

      try {
        await sendEmail({
          to: supportEmail,
          replyTo: user?.email || undefined,
          subject:
            `Kërkesë për planin ${requestedPlan.name} ` + `- ${businessName}`,
          html,
        });
      } catch (emailError) {
        logServerError("requestSubscriptionPlanAction:sendEmail", emailError, {
          requestId: request.id,
          businessId,
        });
      }
    }

    revalidatePath("/dashboard/settings/subscription");

    revalidatePath("/admin/plan-requests");

    return actionSuccess({
      message:
        "Kërkesa u regjistrua me sukses. Mund ta ndjekësh nga njoftimet e biznesit.",
      data: {
        requestId: request.id,
        planId: requestedPlan.id,
        planName: requestedPlan.name,
      },
    });
  } catch (error) {
    logServerError("requestSubscriptionPlanAction", error, {
      planId,
    });

    return errorFailure(error, {
      fallbackCode: ERROR_CODES.INTERNAL_ERROR,
      fallbackMessage: "Kërkesa nuk u regjistrua. Provo përsëri pas pak.",
    });
  }
}
