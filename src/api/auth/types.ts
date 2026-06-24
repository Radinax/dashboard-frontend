import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string(),
});
export type User = z.infer<typeof UserSchema>;

/** The backend returns the user plus a short-lived access token (refresh rides a cookie). */
export const SessionSchema = z.object({
  user: UserSchema,
  accessToken: z.string(),
});
export type Session = z.infer<typeof SessionSchema>;

export const MeSchema = z.object({ user: UserSchema });

// ── Form contracts (also used by React Hook Form via zodResolver) ──
export const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;
