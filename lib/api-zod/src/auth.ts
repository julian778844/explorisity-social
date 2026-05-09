import { z } from "zod";

export const usernameSchema = z
  .string()
  .min(3, "Username must be at least 3 characters")
  .max(32)
  .regex(/^[a-zA-Z0-9_.-]+$/, "Letters, numbers, dot, dash, underscore only");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);

const optionalEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email")
  .max(254)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(32)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

export const signupSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  displayName: z.string().min(1).max(64).optional(),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  emailOptIn: z.boolean().optional().default(true),
  smsOptIn: z.boolean().optional().default(false),
  scholarshipAlerts: z.boolean().optional().default(true),
  jobAlerts: z.boolean().optional().default(true),
  schoolNewsAlerts: z.boolean().optional().default(true),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  username: z.string().min(1).max(254),
  password: z.string().min(1).max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

const socialHandleSchema = z
  .string()
  .max(200)
  .nullable()
  .optional()
  .transform((v) => (typeof v === "string" ? v.trim() : v))
  .transform((v) => (v === "" ? null : v));

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(500).nullable().optional(),
  email: z.string().email().max(254).nullable().optional(),
  phone: z.string().max(32).nullable().optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  instagram: socialHandleSchema,
  linkedin: socialHandleSchema,
  facebook: socialHandleSchema,
  twitter: socialHandleSchema,
  tiktok: socialHandleSchema,
  youtube: socialHandleSchema,
  emailOptIn: z.boolean().optional(),
  smsOptIn: z.boolean().optional(),
  scholarshipAlerts: z.boolean().optional(),
  jobAlerts: z.boolean().optional(),
  schoolNewsAlerts: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const SCHOOL_TYPE_VALUES = ["undergrad", "law", "mba", "med", "trade"] as const;

export const followInputSchema = z.object({
  schoolType: z.enum(SCHOOL_TYPE_VALUES),
  schoolId: z.string().min(1).max(80),
});
export type FollowInput = z.infer<typeof followInputSchema>;

export const followItemSchema = z.object({
  id: z.number().int(),
  schoolType: z.enum(SCHOOL_TYPE_VALUES),
  schoolId: z.string(),
  createdAt: z.string(),
});
export type FollowItem = z.infer<typeof followItemSchema>;
