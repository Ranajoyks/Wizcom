import messaging from '@react-native-firebase/messaging';
import {Platform} from 'react-native';
import NavigationService from './NotificationNavigation';
import notifee, {AndroidImportance} from '@notifee/react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProps} from '../Core/BaseProps';
import User from '../Entity/User';
import {ChatUser} from '../Entity/ChatUser';
import {navigationRef} from '../App';
import {NotificationUser} from '../Entity/NotificationUser';
import {useAppSelector} from '../Redux/Hooks';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    // getFcmToken()
  }
}

const getFcmToken = async () => {
  try {
    const token = await messaging().getToken();
    console.log('fcm token:', token);
  } catch (error) {
    console.log('error in creating token');
  }
};

async function onDisplayNotification(data: any) {
  // Request permissions (required for iOS)

  if (Platform.OS == 'ios') {
    await notifee.requestPermission();
  }

  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: data?.data?.channel_id,
    name: data?.data?.channel_name,
    sound: data?.data?.sound_name,
    importance: AndroidImportance.HIGH,
  });

  // Display a notification
  await notifee.displayNotification({
    title: data?.notification.title,
    body: data?.notification.body,
    android: {
      channelId,
    },
  });
}

export async function notificationListeners() {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', remoteMessage);
    onDisplayNotification(remoteMessage);
  });

  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage,
    );
    console.log(remoteMessage.data);

    if (
      remoteMessage.data &&
      remoteMessage?.data.PageName == 'OneToOneChatPage2'
    ) {
      var ReceiverID = remoteMessage.data.Id;
      const inputString = ReceiverID as string;
      const extractedNumber = parseInt(inputString.split('_')[1], 10);

      console.log(extractedNumber);
      navigationRef.current?.navigate('OneToOneChatPage2', {
        SecondUser: extractedNumber,
      });
    }
    if (
      remoteMessage.data &&
      remoteMessage?.data.PageName == 'GroupChatDetailsPage2'
    ) {
      var GroupID = remoteMessage.data.Id;
      const inputString = GroupID as string;
      const extractedNumber = parseInt(inputString);
      console.log(extractedNumber);
      navigationRef.current?.navigate('GroupChatDetailsPage2', {
        Group: GroupID,
      });
    }
    if (
      remoteMessage.data &&
      remoteMessage?.data.PageName == 'NotificationDetailsPage'
    ) {
      var ReceiverID = remoteMessage.data.Id;
      const inputString = ReceiverID as string;
      const extractedNumber = parseInt(inputString.split('_')[1], 10);

      console.log(extractedNumber);
      navigationRef.current?.navigate('NotificationDetailsPage', {
        SecondUser: extractedNumber,
      });
    }
  });

  // // Check whether an initial notification is available
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage,
        );
        if (
          remoteMessage.data &&
          remoteMessage?.data.PageName == 'OneToOneChatPage2'
        ) {
          var ReceiverID = remoteMessage.data.Id;
          const inputString = ReceiverID as string;
          const extractedNumber = parseInt(inputString.split('_')[1], 10);

          console.log(extractedNumber);
          navigationRef.current?.navigate('OneToOneChatPage2', {
            SecondUser: extractedNumber,
          });
        }
        if (
          remoteMessage.data &&
          remoteMessage?.data.PageName == 'GroupChatDetailsPage2'
        ) {
          var GroupID = remoteMessage.data.Id;
          const inputString = GroupID as string;
          const extractedNumber = parseInt(inputString);
          console.log(extractedNumber);
          navigationRef.current?.navigate('GroupChatDetailsPage2', {
            Group: GroupID,
          });
        }
        if (
          remoteMessage.data &&
          remoteMessage?.data.PageName == 'NotificationDetailsPage'
        ) {
          var ReceiverID = remoteMessage.data.Id;
          const inputString = ReceiverID as string;
          const extractedNumber = parseInt(inputString.split('_')[1], 10);

          console.log(extractedNumber);
          navigationRef.current?.navigate('NotificationDetailsPage', {
            SecondUser: extractedNumber,
          });
        }
      }
    });

  return unsubscribe;
}
