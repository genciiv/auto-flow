"use server";

import { signOut } from "@/auth";

export async function logoutCustomerAction() {
  await signOut({
    redirectTo: "/login",
  });
}
