import { z } from "zod";

// Email validation schema
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  z.email("Please enter a valid email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .regex(/^\S*$/, "Password cannot contain whitespaces");

// Confirm password validation schema
export const confirmPasswordSchema = z
  .string()
  .min(1, "Please confirm your password");

// Sign up form validation schema
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Sign in form validation schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Types
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
