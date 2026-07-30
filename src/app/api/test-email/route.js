import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { EMAIL_CONFIG, emailLayout, sendEmail } from "@/lib/email";
import { getFirstValidationMessage, validateObject } from "@/lib/validation";
import { testEmailSchema } from "@/schemas/api-schema";

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Duhet të identifikohesh.",
        },
        {
          status: 401,
        },
      );
    }

    if (session.user.globalRole !== "PLATFORM_ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Nuk ke leje për të testuar sistemin e email-eve.",
        },
        {
          status: 403,
        },
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Të dhënat JSON nuk janë të vlefshme.",
        },
        {
          status: 400,
        },
      );
    }

    const validationResult = validateObject(testEmailSchema, body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: getFirstValidationMessage(
            validationResult.error,
            "Kontrollo të dhënat e email-it.",
          ),
        },
        {
          status: 400,
        },
      );
    }

    const { email, name } = validationResult.data;

    const html = emailLayout({
      name: name || "Administrator",
      title: "Test email nga AutoFlow",
      content: "Sistemi i email-eve është lidhur me sukses.",
      buttonText: "Hap AutoFlow",
      buttonUrl: EMAIL_CONFIG.appUrl,
    });

    const result = await sendEmail({
      to: email,
      subject: "Test email",
      html,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Gabim gjatë testimit të email-it:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Email-i testues nuk mund të dërgohej.",
      },
      {
        status: 500,
      },
    );
  }
}
