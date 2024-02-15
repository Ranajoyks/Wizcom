import React, { useEffect, useState } from 'react';

import AppStack, { RootStackParamList } from './Root/AppStack';
import { DefaultTheme, PaperProvider, Snackbar } from 'react-native-paper';
import { Alert, BackHandler } from 'react-native';
import { Provider } from 'react-redux';
import { store } from './Redux/Store';
import { useAppDispatch, useAppSelector } from './Redux/Hooks';
import SnackbarOptions from './Redux/Reducer/SnackbarOptions';
import CustomModalIndicator from './Control/CustomModalIndicator';
import { NavigationContainerRef, useNavigation } from '@react-navigation/native';
import { NavigationProps } from './Core/BaseProps';
import { MPopUpLoader } from './Control/MPopUpLoader';
import SessionHelper from './Core/SessionHelper';
import { SignalRHubConnection } from './DataAccess/SignalRHubConnection';



export const navigationRef = React.createRef<NavigationContainerRef<RootStackParamList>>();

const App = (props: any) => {
  const snackbarOptions = useAppSelector((state) => state.SnackbarOptions)
  const pageOptions = useAppSelector((state) => state.PageOptions)


  const dispatch = useAppDispatch()
  //const navigate= useNavigation<NavigationProps>()
  useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', backPressed);

    // returned function will be called on component unmount 
    return () => {

      BackHandler.removeEventListener('hardwareBackPress', backPressed)
    }
  }, [])

  const backPressed = () => {
    if (navigationRef?.current?.canGoBack()) {
      navigationRef.current.goBack()
      return true;
    }

    Alert.alert(
      'Exit!!',
      'Do you want to exit?',
      [
        { text: 'No', onPress: () => { } },
        {
          text: 'Yes', onPress: async () => {
            await SignalRHubConnection.Disconnect()
            BackHandler.exitApp()
          }
        },
      ],
      { cancelable: false }
    );
    return true;
  }

  const lightTheme = {
    ...DefaultTheme,
    dark: false,
  };

  const theme = lightTheme;

  return (
    <PaperProvider theme={theme}>
      <MPopUpLoader mode='Square' visible={pageOptions.IsPageLoading}></MPopUpLoader>
      <AppStack />
      <Snackbar
        style={{ zIndex: 1001 }}
        visible={snackbarOptions.State == "Open"}
        onDismiss={() => dispatch(SnackbarOptions.actions.Close())}
        duration={5000}
        elevation={1}

        action={{
          label: 'Dismiss',
          onPress: () => dispatch(SnackbarOptions.actions.Close())
        }}
      >
        {snackbarOptions.Text}
      </Snackbar>
    </PaperProvider>
  );
}



const AppWrapper = () => {


  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

export default AppWrapper