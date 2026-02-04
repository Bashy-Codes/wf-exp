import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/Theme";
import { useCreateProfile } from "@/hooks/useCreateProfile";
import { useTranslation } from "react-i18next";

// components
import { ScreenHeader } from "@/components/ScreenHeader";
import { LoadingModal } from "@/components/common/LoadingModal";
import { KeyboardHandler } from "@/components/KeyboardHandler";
import { Button } from "@/components/ui/Button";

export const CreateProfileComponent = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    currentStep,
    scrollViewRef,
    loadingModalState,
    control,
    errors,
    getValues,
    currentStepData,
    isLastStep,
    isFirstStep,
    progressPercentage,
    handleNext,
    handleBack,
    getButtonText,
    onUsernameStatusChange,
    handleLoadingModalComplete,
    STEPS,
  } = useCreateProfile();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    stepContainer: {
      paddingTop: 20,
      paddingBottom: 20,
    },
    progressContainer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    progressBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.colors.success,
      borderRadius: 2,
    },
    buttonContainer: {
      flexDirection: "row",
      paddingHorizontal: 18,
      gap: 18
    }
  });

  const CurrentStepComponent = currentStepData?.component;

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "left", "right"]}>
      <ScreenHeader
        title={currentStepData?.title}
        onBack={handleBack}
      />

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercentage}%` }]}
          />
        </View>
      </View>

      {/* Wrap ScrollView in KeyboardAvoidingView */}
      <KeyboardHandler enabled={true}>
        {/* Step Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={styles.stepContainer}>
            {CurrentStepComponent && (
              <CurrentStepComponent
                control={control}
                errors={errors}
                onUsernameStatusChange={
                  currentStep === 1 ? onUsernameStatusChange : undefined
                }
                userData={
                  currentStep === 5
                    ? {
                      birthdate: getValues("birthdate"),
                      gender: getValues("gender"),
                    }
                    : undefined
                }
              />
            )}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {!isFirstStep && (
              <Button
                onPress={handleBack}
                title={t("common.back")}
                bgColor={theme.colors.textMuted}
                style={{ flex: 1 }}
              />
            )}

            <Button
              onPress={handleNext}
              title={getButtonText()}
              style={{ flex: 1 }}
            />
          </View>
        </ScrollView>
      </KeyboardHandler>

      {/* Loading Modal */}
      <LoadingModal
        visible={loadingModalState !== 'hidden'}
        state={loadingModalState === 'hidden' ? 'loading' : loadingModalState}
        onComplete={handleLoadingModalComplete}
      />
    </SafeAreaView>
  );
};