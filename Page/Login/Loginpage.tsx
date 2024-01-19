import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  BackHandler 
} from 'react-native';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import {Button} from 'native-base';
import SessionHelper from '../../Core/SessionHelper';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import messaging from '@react-native-firebase/messaging';

import { request, check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import PermissionHelper from '../../Core/PermissionHelper';
export class LoginViewModel {
  UserName: string = '';
  Password: string = '';
  BranchList: [] = [];
  showMessage: boolean = false;
  DeviceId: string = '';
}
export default class Loginpage extends BaseComponent<any, LoginViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new LoginViewModel());
  }
  // async componentDidMount(): Promise<void> {
  //   var value = await SessionHelper.GetSession();
  //   console.log('value: ', value);
  // }
  async componentDidMount() {
    var Model = this.state.Model;
    var value = await SessionHelper.GetSession();
    console.log("SessionValue: ",`ASP.NET_SessionId=${value}`);
    

    // const deviceId = DeviceInfo.getDeviceId();
    const checkPermission = await this.checkNotificationPermission();
    console.log("checkPermission: ",checkPermission);
    if (checkPermission !== RESULTS.GRANTED) {
      
      const request = await this.requestNotificationPermission();
      console.log("request: ",request);
       if(request !== RESULTS.GRANTED){
       // BackHandler.exitApp()
        }
    }
    this.FirebaseSetup()
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
  FirebaseSetup=()=>{
    var Model = this.state.Model
    messaging()
    .requestPermission()
    .then(() => {
      return messaging().getToken();
    })
    .then((token) => {
      // Log the FCM token
      console.log('FCM Token:', token);
      Model.DeviceId = token;
      this.UpdateViewModel();
      // console.log('deviceId: ', deviceId);
      SessionHelper.SetFCMTokenSession(token)
    })
    .catch((error) => {
      console.error('Error getting FCM token:', error);
    });
  }
  onChangeText() {}
  handleSetUrl = () => {
    this.props.navigation.navigate({
      name: 'Branchpage',
    });
  };
  Login = async () => {
    var Model = this.state.Model;
    SessionHelper.SetUserNameSession(Model.UserName);
    SessionHelper.SetDeviceIdSession(Model.DeviceId);
    var value = await SessionHelper.GetSession();
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    const LoginCredential = {
      objUsr: {
        sName: Model.UserName,
        sCode: Model.Password,
      },
    };
    axios
      .post(
        `http://eiplutm.eresourceerp.com/AzaaleaR/API/Sys/Sys.aspx/JValidate`,
        LoginCredential,
        {headers: headers},
      )
      .then(response => {
        console.log('response3`', response.data.d);
        if (!response.data.d.bStatus) {
          Model.showMessage = true;
          this.UpdateViewModel();
        }
        if (response.data.d.bStatus) {       
          Model.showMessage = false;
          // Model.BranchList = response.data.d.data.ado
          this.UpdateViewModel();
          this.props.navigation.navigate('Branchpage', {
            BranchList: response.data.d.data.ado,
            // UserName: Model.UserName,
          });
          axios
            .get(
              `https://wemessanger.azurewebsites.net/api/user?sname=${Model.UserName}&deviceId=${Model.DeviceId}`,
            )
            .then(response => {
              console.log('LogIndata', response.data);
              SessionHelper.SetUserDetailsSession(response.data[0]);
              SessionHelper.SetUserIDSession(response.data[0].lId);
              var Connection = new signalR.HubConnectionBuilder()
              .withUrl(`https://wemessanger.azurewebsites.net/chatHub?UserId=u_${response.data[0].lId.toString()}`)
              .build();
              Connection.start().then(() => {
                console.log('SignalR connected');
                console.log('----',response.data[0].lId.toString());
                Connection.invoke(
                  'JoinChat',
                  'u_'+response.data[0].lId.toString(),
                ).then(res => {
                  Connection.invoke(
                    'IsUserConnected',
                    'u_'+response.data[0].lId.toString(),
                  )
                    .then(isConnected => {
                      console.log('Connection', isConnected);

                      if (isConnected) {
                        console.log(`User: u_${response.data[0].lId} is live`);
                      } else {
                        console.log(`User:  u_${response.data[0].lId} is not live`);
                      }
                    })
                    .catch(error => {
                      console.log(error);
                    });
                });
              });
            })
            .catch(error => {
              console.error('Error fetching data:', error);
            });
        }
      })
      .catch(error => {
        Model.showMessage = true;
        if (error.response) {
          console.log('Response data:', error.response.data);
          console.log('Response status:', error.response.status);
          console.log('Response headers:', error.response.headers);
        } else if (error.request) {
          console.log('No response received:', error.request);
        } else {
          // Model.showMessage = true
          console.log('Error during request setup:', error.message);
        }
        this.UpdateViewModel();
      });
  };

  render() {
    var Model = this.state.Model;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={require('../../assets/logo.png')}
              style={{height: 30, width: 30, marginLeft: 10}}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Login</Text>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate({
                name: 'settingspage',
              });
            }}>
            <Image
              source={require('../../assets/settings.png')}
              style={{height: 30, width: 30, marginRight: 10}}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.text}>Please Login</Text>
          <Text style={styles.text2}>USER NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="User Name" // Concatenate prefix with the value
            onChangeText={text => {
              Model.UserName = text;
              this.UpdateViewModel();
            }}
          />
          <Text style={styles.text3}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={true}
            placeholder="Password" // Concatenate prefix with the value
            onChangeText={text => {
              Model.Password = text;
              this.UpdateViewModel;
            }}
          />
          {Model.showMessage ? (
            <Text style={styles.text4}>
              Invalid User Name or {'\n'} Password
            </Text>
          ) : null}
        </View>
        <Button onPress={this.Login} style={styles.buttontest}>
          <Text
            style={{
              color: 'white',
              // fontWeight: '800',
              fontFamily: 'Poppins-Bold',
            }}>
            Login
          </Text>
        </Button>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Soft blue background
  },
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // borderBottomWidth: 1,
    // borderColor: '#d9eeff', // Lighter blue accent
  },
  icon: {
    color: '#fff', // White icons
  },
  title: {
    fontSize: 30,
    fontWeight: '500',
    fontFamily: 'Poppins-Regular',
    // color: '#2196f3', // Darker blue title
  },
  body: {
    padding: 20,
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
    // marginTop:10,
    // marginBottom: 5,
    borderRadius: 7,
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily:"OpenSans-Regular",
  },
  buttontest: {
    alignSelf: 'center',
    // marginTop: '80%',
    position: 'absolute',
    bottom: 20,
    // marginBottom:0,
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,
    width: '90%',
    // right: 10,
  },
});
