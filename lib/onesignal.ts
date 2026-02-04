import React, { useEffect } from 'react';
// Include the OneSignal package
import { OneSignal, LogLevel } from 'react-native-onesignal';

export default function RootLayout() {
    // Initialize OneSignal in useEffect to ensure it runs only once
    useEffect(() => {
        // Enable verbose logging for debugging (remove in production)
        OneSignal.Debug.setLogLevel(LogLevel.Verbose);
        // Initialize with your OneSignal App ID
        OneSignal.initialize('0308d119-0577-4c11-855e-825e3c467b27');
        // Use this method to prompt for push notifications.
        // We recommend removing this method after testing and instead use In-App Messages to prompt for notification permission.
        OneSignal.Notifications.requestPermission(false);
    }, []); // Ensure this only runs once on app mount
}