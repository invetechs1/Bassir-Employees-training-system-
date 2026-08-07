"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import {
  verifyPlatformCredentials,
  createPlatformToken,
  setPlatformCookie,
  isPlatformConfigured,
} from "@/lib/platform";
import { rateLimit, clientIp, STRICT_LIMIT } from "@/lib/rate-limit";

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
  // The single operator credential guards every tenant — throttle it hardest.
  const ip = clientIp(await headers());
  const limited = rateLimit(`platform-login:${ip}`, STRICT_LIMIT);
  if (!limited.allowed) {
    return {
      error: `Too many attempts. Please wait ${Math.ceil(
        limited.retryAfterSeconds / 60
      )} minute(s) and try again.`,
    };
  }
  if (!verifyPlatformCredentials(parsed.data.email, parsed.data.password)) {
    return { error: "Invalid operator credentials." };
  }
  const token = await createPlatformToken(parsed.data.email.toLowerCase());
  await setPlatformCookie(token);
  redirect("/platform");
}
