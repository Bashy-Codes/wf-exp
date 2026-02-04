import { z } from "zod";

// Basic validation schemas for reusable types
const nameSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, "")) // Auto-remove all spaces
  .pipe(
    z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(12, "Name must be at most 12 characters")
      .regex(/^[a-zA-Z]+$/, "Name can only contain letters")
  );

const usernameSchema = z
  .string()
  .transform((val) => val.replace(/\s+/g, "")) // Auto-remove all spaces
  .pipe(
    z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(12, "Username must be at most 12 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
  );

const genderSchema = z.enum(["male", "female", "other"], {
  message: "Please select a gender",
});

const birthdateSchema = z
  .date({
    message: "Please select a valid date",
  })
  .refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    return age >= 13 && age <= 100;
  }, "You must be between 13 years old");

const countrySchema = z.string().min(1, "Please select a country");

const languagesSchema = z
  .array(z.string())
  .min(1, "Please select at least one language");

const bioSchema = z
  .string()
  .min(100, "Bio must be at least 100 characters")
  .max(1000, "Bio must be at most 1000 characters");

const hobbiesSchema = z
  .array(z.string())
  .min(1, "Please select at least one hobby");

const profilePictureSchema = z
  .string()
  .min(1, "Please select a profile picture");

const genderPreferenceSchema = z.boolean();

// Main profile creation schema
export const profileCreationSchema = z
  .object({
    // Step 1: Basic Info
    name: nameSchema,
    username: usernameSchema,
    gender: genderSchema,
    birthdate: birthdateSchema,

    // Step 2: Languages & Country
    country: countrySchema,
    languagesSpoken: languagesSchema,
    languagesLearning: languagesSchema,

    // Step 3: About Me
    bio: bioSchema,
    hobbies: hobbiesSchema,

    // Step 4: Finalize
    profilePicture: profilePictureSchema,
    genderPreference: genderPreferenceSchema,
  })

// Individual step schemas for step-by-step validation
export const basicInfoSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  gender: genderSchema,
  birthdate: birthdateSchema,
});

export const languagesCountrySchema = z.object({
  country: countrySchema,
  languagesSpoken: languagesSchema,
  languagesLearning: languagesSchema,
});

export const aboutMeSchema = z.object({
  bio: bioSchema,
  hobbies: hobbiesSchema,
});


export const finalizeSchema = z.object({
  profilePicture: profilePictureSchema,
  genderPreference: genderPreferenceSchema,
});

// Edit profile schema (excludes username, gender, birthdate)
export const editProfileSchema = z
  .object({
    // Step 1: Basic Info (only name)
    name: nameSchema,

    // Step 2: Languages & Country
    country: countrySchema,
    languagesSpoken: languagesSchema,
    languagesLearning: languagesSchema,

    // Step 3: About Me
    bio: bioSchema,
    hobbies: hobbiesSchema,

    // Step 4: Finalize
    profilePicture: profilePictureSchema,
    genderPreference: genderPreferenceSchema,
  })

// Edit profile step schemas
export const editBasicInfoSchema = z.object({
  name: nameSchema,
});

// Type exports for TypeScript
export type ProfileCreationData = z.infer<typeof profileCreationSchema>;
export type EditProfileData = z.infer<typeof editProfileSchema>;
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type EditBasicInfoData = z.infer<typeof editBasicInfoSchema>;
export type LanguagesCountryData = z.infer<typeof languagesCountrySchema>;
export type AboutMeData = z.infer<typeof aboutMeSchema>;
export type FinalizeData = z.infer<typeof finalizeSchema>;

// Helper function to validate specific steps
export const validateStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return basicInfoSchema.safeParse(data);
    case 2:
      return languagesCountrySchema.safeParse(data);
    case 3:
      return aboutMeSchema.safeParse(data);
    case 4:
      return finalizeSchema.safeParse(data);
    default:
      throw new Error("Invalid step number");
  }
};

// Helper function to validate edit profile steps
export const validateEditStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return editBasicInfoSchema.safeParse(data);
    case 2:
      return languagesCountrySchema.safeParse(data);
    case 3:
      return aboutMeSchema.safeParse(data);
    case 4:
      return finalizeSchema.safeParse(data);
    default:
      throw new Error("Invalid step number");
  }
};
