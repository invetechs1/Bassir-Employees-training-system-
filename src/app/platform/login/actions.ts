"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  verifyPlatformCredentials,
  createPlatformToken,
  setPlatformCookie,
  isPlatformConfigured,
} from "@/lib/platform";

const Schema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export interface PlatformLoginState {
  error?: string;
}

export async function platformLoginAction(
  _prev: PlatformLoginState,
  formData: FormData
): Promise<PlatformLoginState> {
  if (!isPlatformConfigured()) {
    return {
      error:
        "The platform console isn't configured. Set PLATFORM_ADMIN_EMAIL and PLATFORM_ADMIN_PASSWORD.",
    };
  }
  const parsed = Schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter your email and password." };
  }
  if (!verifyPlatformCredentials(parsed.data.email, parsed.data.password)) {
    return { error: "Invalid operator credentials." };
  }
  const token = await createPlatformToken(parsed.data.email.toLowerCase());
  await setPlatformCookie(token);
  redirect("/platform");
}
