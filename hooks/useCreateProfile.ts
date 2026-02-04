import { useState, useMemo, useRef } from "react";
import { ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ProfileCreationData,
  profileCreationSchema,
} from "@/validations/profile";
import { BasicInfo } from "@/components/profile-management/BasicInfo";
import { LanguagesCountry } from "@/components/profile-management/LanguagesCountry";
import { AboutMe } from "@/components/profile-management/AboutMe";
import { Finalize } from "@/components/profile-management/Finalize";
import { api } from "@/convex/_generated/api";
import { uploadProfileImageToR2 } from "@/utils/uploadImages";

type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

const getSteps = (t: any) => [
  { id: 1, title: t("screenTitles.profileManagement.first"), component: BasicInfo },
  {
    id: 2,
    title: t("screenTitles.profileManagement.second"),
    component: LanguagesCountry,
  },
  { id: 3, title: t("screenTitles.profileManagement.third"), component: AboutMe },
  { id: 4, title: t("screenTitles.profileManagement.final"), component: Finalize },
];

export const useCreateProfile = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingModalState, setLoadingModalState] = useState<LoadingModalState>('hidden');
  const [usernameStatus, setUsernameStatus] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get translated steps
  const STEPS = getSteps(t);

  // Convex mutations
  const createProfile = useMutation(api.users.mutations.createProfile);
  const generateProfileUploadUrl = useMutation(
    api.storage.generateProfileUploadUrl
  );
  const syncMetadata = useMutation(api.storage.syncMetadata);

  const {
    control,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors },
  } = useForm<ProfileCreationData>({
    resolver: zodResolver(profileCreationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      username: "",
      gender: undefined as any,
      birthdate: undefined as any,
      country: "",
      languagesSpoken: [],
      languagesLearning: [],
      bio: "",
      hobbies: [],
      profilePicture: "",
      genderPreference: false,
    },
  });

  const currentStepData = useMemo(
    () => STEPS.find((step) => step.id === currentStep),
    [currentStep]
  );

  const isLastStep = currentStep === STEPS.length;
  const isFirstStep = currentStep === 1;

  const validateCurrentStep = async () => {
    // Get the field names for the current step
    const getStepFields = (step: number): (keyof ProfileCreationData)[] => {
      switch (step) {
        case 1:
          return ["name", "username", "gender", "birthdate"];
        case 2:
          return ["country", "languagesSpoken", "languagesLearning"];
        case 3:
          return ["bio", "hobbies"];
        case 4:
          return ["profilePicture", "genderPreference"];
        default:
          return [];
      }
    };

    // Trigger validation for current step fields - this will validate even untouched fields
    const stepFields = getStepFields(currentStep);
    const isValid = await trigger(stepFields);

    if (!isValid) {
      return false;
    }

    // Additional validation for step 1: check username availability
    if (currentStep === 1) {
      if (usernameStatus !== "available") {
        return false;
      }
    }

    return true;
  };

  const onSubmit = handleSubmit(async (data: ProfileCreationData) => {
    try {
      setLoadingModalState('loading');

      // Upload profile picture first
      let profilePictureKey = "";

      if (data.profilePicture) {
        // Upload profile picture with user-based custom key
        const uploadResult = await uploadProfileImageToR2(
          data.profilePicture,
          generateProfileUploadUrl,
          syncMetadata
        );
        if (!uploadResult || !uploadResult.key) {
          throw new Error("Failed to upload profile picture");
        }
        profilePictureKey = uploadResult.key;
      }

      // Create profile
      await createProfile({
        name: data.name,
        userName: data.username,
        profilePicture: profilePictureKey,
        gender: data.gender as "male" | "female" | "other",
        birthDate: data.birthdate.toISOString(),
        country: data.country,
        spokenLanguages: data.languagesSpoken || [],
        learningLanguages: data.languagesLearning || [],
        aboutMe: data.bio,
        hobbies: data.hobbies || [],
        genderPreference: data.genderPreference,
      });

      setLoadingModalState('success');

      // Navigate to profile screen after success animation
      setTimeout(() => {
        router.replace("/(tabs)/profile");
      }, 2000);
    } catch (error) {
      console.error("Profile creation failed:", error);
      setLoadingModalState('error');
    }
  });

  // Loading modal handler
  const handleLoadingModalComplete = () => {
    setLoadingModalState('hidden');
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    if (!isStepValid) return;

    if (isLastStep) {
      onSubmit();
    } else {
      setCurrentStep((prev) => prev + 1);
      // Scroll to top when moving to next step
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    }
  };

  const handleBack = () => {
    if (isFirstStep) {
      // Handle navigation back to previous screen
      return;
    }
    setCurrentStep((prev) => prev - 1);
    // Scroll to top when moving to previous step
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const getButtonText = () => {
    if (isLastStep) return t("common.done");
    return t("common.continue");
  };

  const progressPercentage = (currentStep / STEPS.length) * 100;

  return {
    // State
    currentStep,
    scrollViewRef,
    loadingModalState,

    // Form
    control,
    errors,
    getValues,

    // Computed values
    currentStepData,
    isLastStep,
    isFirstStep,
    progressPercentage,

    // Actions
    handleNext,
    handleBack,
    getButtonText,
    onUsernameStatusChange: setUsernameStatus,
    handleLoadingModalComplete,

    // Constants
    STEPS,
  };
};
