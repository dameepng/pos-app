import { z } from "zod";

const AdminUpdateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "CASHIER"]).optional(),
  password: z.string().min(8, "password must be at least 8 characters").optional(),
});

export function validateAdminUpdateUserBody(body) {
  const result = AdminUpdateUserSchema.safeParse(body ?? {});

  if (!result.success) {
    return { error: { message: result.error.issues[0]?.message, status: 400 } };
  }

  if (
    result.data.email === undefined &&
    result.data.role === undefined &&
    result.data.password === undefined
  ) {
    return { error: { message: "No fields to update", status: 400 } };
  }

  return { value: result.data };
}
