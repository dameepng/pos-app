import { z } from "zod";

const AdminUpdateUserSchema = z.object({
  email: z.string().email().optional(),
  role: z.enum(["OWNER", "OPS", "CASHIER"]).optional(),
  password: z.string().min(8, "password must be at least 8 characters").optional(),
});

const AdminCreateUserSchema = z.object({
  name: z.string().trim().min(2, "name must be at least 2 characters"),
  email: z.string().trim().email(),
  role: z.enum(["OPS", "CASHIER"]),
  password: z.string().min(8, "password must be at least 8 characters"),
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

export function validateAdminCreateUserBody(body) {
  const result = AdminCreateUserSchema.safeParse(body ?? {});
  if (!result.success) {
    return { error: { message: result.error.issues[0]?.message, status: 400 } };
  }
  return { value: result.data };
}
