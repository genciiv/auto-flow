import { NextResponse } from "next/server";
import { sendEmail, emailLayout, EMAIL_CONFIG } from "@/lib/email";

export async function POST(request) {
  try {
    const { email, name } = await request.json();

    const html = emailLayout({
      name,
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
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 },
    );
  }
}
