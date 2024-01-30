import PushNotification from 'react-native-push-notification';

export const configureNotifications = () => {
  PushNotification.configure({
    // (Optional) Configure notification channels for Android
    onNotification: (notification) => {
      // Handle Notification (optional)
    },
    permissions: {
      alert: true,
      sound: true,
    },
  });
};


