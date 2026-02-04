import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "convex/react";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  EditProfileData,
  editProfileSchema,
} from "@/validations/profile";
import { EditBasicInfo } from "@/components/profile-management/EditBasicInfo";
import { LanguagesCountry } from "@/components/profile-management/LanguagesCountry";
import { AboutMe } from "@/components/profile-management/AboutMe";
import { Finalize } from "@/components/profile-management/Finalize";
import { api } from "@/convex/_generated/api";
import { uploadProfileImageToR2 } from "@/utils/uploadImages";

const getEditSteps = (t: any) => [
  { id: 1, title: t("screenTitles.profileManagement.first"), component: EditBasicInfo },
  {
    id: 2,
    title: t("screenTitles.profileManagement.second"),
    component: LanguagesCountry,
  },
  { id: 3, title: t("screenTitles.profileManagement.third"), component: AboutMe },
  { id: 4, title: t("screenTitles.profileManagement.final"), component: Finalize },
];

type LoadingModalState = 'hidden' | 'loading' | 'success' | 'error';

export const useEditProfile = () => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingModalState, setLoadingModalState] = useState<LoadingModalState>('hidden');
  const scrollViewRef = useRef<ScrollView>(null);

  // Get translated steps
  const STEPS = getEditSteps(t);

  // Get current profile data
  const profileData = useQuery(api.users.queries.getCurrentProfile);

  // Convex mutations
  const updateProfile = useMutation(api.users.mutations.updateProfile);
  const generateProfileUploadUrl = useMutation(
    api.storage.generateProfileUploadUrl
  );
  const syncMetadata = useMutation(api.storage.syncMetadata);

  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "all",
    defaultValues: {
      name: "",
      country: "",
      languagesSpoken: [],
      languagesLearning: [],
      bio: "",
      hobbies: [],
      profilePicture: "",
      genderPreference: false,
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (profileData) {
      reset({
        name: profileData.name,
        country: profileData.country,
        languagesSpoken: profileData.spokenLanguages,
        languagesLearning: profileData.learningLanguages,
        bio: profileData.aboutMe,
        hobbies: profileData.hobbies,
        profilePicture: profileData.profilePictureUrl || "",
        genderPreference: profileData.genderPreference || false,
      });
    }
  }, [profileData, reset]);

  const currentStepData = useMemo(
    () => STEPS.find((step) => step.id === currentStep),
    [currentStep]
  );

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === STEPS.length;

  const validateCurrentStep = async () => {
    // Get the field names for the current step
    const getStepFields = (step: number): (keyof EditProfileData)[] => {
      switch (step) {
        case 1:
          return ["name"];
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

    return true;
  };

  const onSubmit = handleSubmit(async (data: EditProfileData) => {
    try {
      setIsUpdating(true);
      setLoadingModalState('loading');

      if (!profileData) {
        throw new Error("Profile data not loaded");
      }

      // Handle profile picture upload if changed
      let profilePictureKey = profileData.profilePicture;

      if (
        data.profilePicture &&
        data.profilePicture !== profileData.profilePictureUrl
      ) {
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

      // Update profile
      await updateProfile({
        name: data.name,
        country: data.country,
        spokenLanguages: data.languagesSpoken || [],
        learningLanguages: data.languagesLearning || [],
        aboutMe: data.bio,
        hobbies: data.hobbies || [],
        genderPreference: data.genderPreference,
        profilePicture: profilePictureKey,
      });

      setLoadingModalState('success');

      // Navigate back after success animation
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error("Profile update failed:", error);
      setLoadingModalState('error');
    } finally {
      setIsUpdating(false);
    }
  });

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
      router.back();
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

  // Loading modal handler
  const handleLoadingModalComplete = useCallback(() => {
    setLoadingModalState('hidden');
  }, []);

  return {
    // State
    currentStep,
    scrollViewRef,
    isUpdating,
    loadingModalState,
    profileData,

    // Form
    control,
    errors,

    // Computed values
    currentStepData,
    isFirstStep,
    isLastStep,
    progressPercentage,

    // Actions
    handleNext,
    handleBack,
    handleLoadingModalComplete,
    getButtonText,

    // Constants
    STEPS,
  };
};
