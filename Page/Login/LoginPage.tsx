import React from 'react';

import { View, Text, StyleSheet, TextInput } from 'react-native';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';

import SessionHelper from '../../Core/SessionHelper';
import messaging from '@react-native-firebase/messaging';

import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PermissionHelper from '../../Core/PermissionHelper';
import BaseViewModel from '../../Core/BaseViewModel';
import ERESApi from '../../DataAccess/ERESApi';
import { connect } from 'react-redux';

import { mapDispatchToProps } from '../../Core/BaseProps';

import { styles } from '../MainStyle';
import CustomButton from '../../Control/CustomButton';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MHeader } from '../../Control/MHeader';
import MTextInput from '../../Control/MTextInput';
import User from '../../Entity/User';
import AuthenticationOptions from '../../Redux/Reducer/AuthenticationOptions';


export class LoginViewModel extends BaseViewModel {
  UserName?: string;
  Password?: string;
}

export class LoginPage extends BaseComponent<'LoginPage', LoginViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new LoginViewModel());
  }

  async componentDidMount() {
    // const deviceId = DeviceInfo.getDeviceId();
    const checkPermission = await this.checkNotificationPermission();
    console.log('checkPermission: ', checkPermission);
    if (checkPermission !== RESULTS.GRANTED) {
      const request = await this.requestNotificationPermission();
      console.log('request: ', request);
      if (request !== RESULTS.GRANTED) {
        // BackHandler.exitApp()
      }
    }
    this.FirebaseSetup();
    PermissionHelper.requestLocationPermission();
  }
  requestNotificationPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    return result;
  };
  checkNotificationPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    return result;
  };
  FirebaseSetup = () => {
    messaging()
      .requestPermission()
      .then(() => {
        return messaging().getToken();
      })
      .then(token => {
        // Log the FCM token
        console.log('FCM Token:', token);
        SessionHelper.SetDeviceId(token);
        this.UpdateViewModel();

        SessionHelper.SetFCMToken(token);
      })
      .catch(error => {
        console.error('Error getting FCM token:', error);
      });
  };

  handleLogin = async () => {
    var Model = this.state.Model;
    this.ShowPageLoader(true);

    const LoginCredential = {
      objUsr: {
        sName: Model.UserName,
        sCode: Model.Password,
      },
    };

    var loginResponse = await ERESApi.JValidate(LoginCredential);
    this.ShowPageLoader(false);
    if (loginResponse.IsKSError || !loginResponse.data?.d?.bStatus) {
      this.ShowToast(
        loginResponse.ErrorInfo ||
        loginResponse.data?.d?.cError ||
        'Some issue happend',
      );
      return;
    }

    var user = {} as User;
    user.userName = Model.UserName!;

    this.props.dispatch(AuthenticationOptions.actions.LogIn(user))
    SessionHelper.SetUserDetails(user);

    this.props.navigation.reset({
      index: 0,
      routes: [
        {
          name: 'BranchPage',
          params: { BranchList: loginResponse.data.d.data.ado },
        },
      ],
    });
  };

  render() {
    var Model = this.state.Model;
    return (
      <SafeAreaView style={styles.container}>
        <MHeader Title="Login"></MHeader>

        <View style={{ padding: 30 }}>
          <Text style={localStyle.text}>Please Login</Text>
          <Text style={localStyle.text2}>USER NAME</Text>

          <TextInput
            style={localStyle.input}
            placeholder="User Name"
            onChangeText={text => {
              Model.UserName = text;
              this.UpdateViewModel();
            }}
          />
          <Text style={localStyle.text3}>PASSWORD</Text>
          <TextInput
            style={localStyle.input}
            secureTextEntry={true}
            placeholder="Password"
            onChangeText={text => {
              Model.Password = text;
              this.UpdateViewModel;
            }}
          />
        </View>
        <CustomButton onPress={this.handleLogin}>Login</CustomButton>
      </SafeAreaView>
    );
  }
}

var connector = connect(null, mapDispatchToProps)(LoginPage);
export default connector;

const localStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Soft blue background
  },

  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
  },
  text2: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 5,
    letterSpacing: 1.2,
  },
  text3: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 5,
    letterSpacing: 1.2,
  },
  text4: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    // alignSelf: 'center',
    marginTop: 10,
    marginBottom: 5,
    letterSpacing: 1.2,
    color: '#fa8a15',
    textAlign: 'center',
  },
  input: {
    alignSelf: 'center',
    width: '95%',
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    borderRadius: 7,
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'OpenSans-Regular',
  },
});
