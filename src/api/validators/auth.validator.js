import { z } from "zod";

const LoginSchema = z.object({
  email: z
    .string()
    .transform((value) => value.trim())
    .refine((value) => value.length > 0, { message: "email is required" }),
  password: z.string().min(1, "password is required"),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "currentPassword is required"),
  newPassword: z.string().min(8, "newPassword must be at least 8 characters"),
});

export function validateLoginBody(body) {
  const result = LoginSchema.safeParse(body ?? {});

  if (!result.success) {
    return {
      error: {
        message: "email and password are required",
        status: 400,
      },
    };
  }

  return { value: result.data };
}

export function validateChangePasswordBody(body) {
  const result = ChangePasswordSchema.safeParse(body ?? {});

  if (!result.success) {
    return { error: { message: result.error.issues[0]?.message, status: 400 } };
  }

  return { value: result.data };
}
