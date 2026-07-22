"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { db } from "@/lib/db";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhone(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export async function registerAction(previousState, formData) {
  const name = String(formData.get("name") ?? "").trim();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const phone = normalizePhone(formData.get("phone"));

  const password = String(formData.get("password") ?? "");

  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!name || !email || !password || !confirmPassword) {
    return {
      error: "Plotëso të gjitha fushat e detyrueshme.",
      success: false,
    };
  }

  if (name.length < 2) {
    return {
      error: "Emri duhet të ketë të paktën 2 karaktere.",
      success: false,
    };
  }

  if (name.length > 100) {
    return {
      error: "Emri është shumë i gjatë.",
      success: false,
    };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return {
      error: "Vendos një adresë email-i të vlefshme.",
      success: false,
    };
  }

  if (phone && phone.length < 6) {
    return {
      error: "Numri i telefonit nuk është i vlefshëm.",
      success: false,
    };
  }

  if (password.length < 8) {
    return {
      error: "Password-i duhet të ketë të paktën 8 karaktere.",
      success: false,
    };
  }

  if (password.length > 100) {
    return {
      error: "Password-i është shumë i gjatë.",
      success: false,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Password-et nuk përputhen.",
      success: false,
    };
  }

  const existingUser = await db.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      error: "Ekziston tashmë një llogari me këtë adresë email-i.",
      success: false,
    };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        globalRole: "CUSTOMER",
        isActive: true,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      return {
        error: "Ekziston tashmë një llogari me këtë adresë email-i.",
        success: false,
      };
    }

    console.error("Gabim gjatë regjistrimit:", error);

    return {
      error: "Nuk ishte e mundur të krijohej llogaria. Provo përsëri.",
      success: false,
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/customer/dashboard",
    });

    return {
      error: null,
      success: true,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error:
          "Llogaria u krijua, por hyrja automatike dështoi. Provo të hysh nga faqja e hyrjes.",
        success: false,
      };
    }

    throw error;
  }
}
