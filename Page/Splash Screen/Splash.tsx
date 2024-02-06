import React, {Component} from 'react';
import {
  View,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
} from 'react-native';
import AppIconImage from '../../assets/AppIconImage';

import BaseColor from '../../Core/BaseTheme';
import LinearGradient from 'react-native-linear-gradient';
import {CommonActions} from '@react-navigation/native';

import {Container, Spinner} from 'native-base';
import axios from 'axios';
import SessionHelper from '../../Core/SessionHelper';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
export class SpalshViewModel {
  URL: string = 'eiplutm.eresourceerp.com/AzaaleaR';
  UserID: string = '';
  ConnectionCode: any;
  FCMToken: string = '';
  Offset: number = new Date().getTimezoneOffset();
  BranchId: any;
}
export default class Splash extends BaseComponent<any, SpalshViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new SpalshViewModel());
    // setTimeout(() => {
    //   this.props.navigation.reset({
    //     index: 0,
    //     routes: [{ name: 'Selectcompanypage' }],
    // });
    // }, 2000);
  }
  async componentDidMount() {
    var Model = this.state.Model;
    console.log('MODELURL : ', Model.URL);
    var value = await SessionHelper.GetSession();
    var UserID = await SessionHelper.GetUserIDSession();
    var URL = await SessionHelper.GetURLSession();
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var FCMTOKEN = await SessionHelper.GetFCMTokenSession();
    var BranchID = await SessionHelper.GetBranchIdSession();
    Model.BranchId = BranchID;
    var date = new Date();
    console.log(date.getTimezoneOffset());
    Model.Offset = date.getTimezoneOffset();
    this.UpdateViewModel();
    Model.FCMToken = FCMTOKEN;
    if (URL) {
      Model.URL = URL;
      this.UpdateViewModel();
    }
    if (UserID) {
      Model.UserID = UserID;
      this.UpdateViewModel();
    }
    console.log('URL: ', URL);
    console.log('UserID: ', UserID);
    console.log('Value: ', value);
    if (value) {
      this.PageRander();
      } else {
        setTimeout(() => {
          this.props.navigation.reset({
            index: 0,
            routes: [{name: 'Selectcompanypage'}],
          });
        }, 2000);
    }
  }
  PageRander = async () => {
    var Model = this.state.Model;
    var value = await SessionHelper.GetSession();
    var companyID = await SessionHelper.GetCompanyIDSession();
    console.log('companyID: ', companyID);

    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    const Data = JSON.stringify({
      userId: `${companyID}_${Model.UserID}`,
      url: `http://${Model.URL}`,
      session: value,
      code: companyID,
    });
    const AutologinData = JSON.stringify({
      sConn: `${companyID}`,
      dOffSet: Model.Offset,
      cPlatForm: 'M',
      lUsrId: parseInt(Model.UserID),
      lCompId: parseInt(Model.BranchId),
    });
    console.log('AutologinData: ', AutologinData);
    axios
      .post(`https://wemessanger.azurewebsites.net/api/user/set`, Data, {
        headers: headers,
      })
      .then((res: any) => {
        console.log('resdata: ', res.data);
        if (res.data) {
          const SaveUserDevice = JSON.stringify({
            userId: `${companyID}_${Model.UserID}`,
            deviceId: Model.FCMToken,
          });
          console.log('SaveUserDevice: ', SaveUserDevice);

          axios
            .post(
              `https://wemessanger.azurewebsites.net/api/user/device`,
              SaveUserDevice,
              {headers: headers},
            )
            .then(DeviceResponse => {
              console.log('DeviceResponse: ', DeviceResponse.data);
              if (DeviceResponse.data) {
                axios
                  .post(
                    `http://eiplutm.eresourceerp.com/AzaaleaR/API/Sys/Sys.aspx/JCheckSession`,
                    {headers: headers},
                  )
                  .then(res => {
                    console.log('SessionResponse: ', res.data.d);
                    if (res.data.d.bStatus) {
                      this.props.navigation.reset({
                        index: 0,
                        routes: [{name: 'Singlechatpage'}],
                      });
                    }
                    if (!res.data.d.bStatus) {
                      axios
                      .post(
                        `http://eiplutm.eresourceerp.com/AzaaleaR/API/Sys/Sys.aspx/JAutoLogin`,
                        AutologinData,
                        {headers: headers},
                      )
                      .then(res => {
                        console.log('Autologin data', res.data);
                        if(res.data.d.bStatus){
                          this.props.navigation.reset({
                            index: 0,
                            routes: [{name: 'Singlechatpage'}],
                          });
                        }
                        if(!res.data.d.bStatus){
                          this.props.navigation.reset({
                            index: 0,
                            routes: [{name: 'Selectcompanypage'}],
                          });
                        }
                      })
                      .catch(err => {
                        console.log('autologinErr: ', err);
                        this.props.navigation.reset({
                          index: 0,
                          routes: [{name: 'Selectcompanypage'}],
                        });
                      });
                      
                    }
                  })
                  .catch(err => {
                    console.log('SessionError: ', err);
                    this.props.navigation.reset({
                      index: 0,
                      routes: [{name: 'Selectcompanypage'}],
                    });
                  });
              }
            })
            .catch(err => {
              console.log('DeviceResponseError: ', err);
            });
        }
      })
      .catch((err: any) => {
        console.log('Err: ', err);
      });
  };

  render() {
    return (
      <LinearGradient
        colors={['#011024', '#002252', '#0248A8']}
        style={styles.gradientContainer}>
        <View>
          <StatusBar
            barStyle="dark-content"
            hidden={true}
            backgroundColor={BaseColor.ColorWhite}
            translucent={true}
          />
          {/* <ImageBackground source={require('./assets/g.jpg')} style={styles.image}> */}
          <View
            style={{
              alignSelf: 'center',
              marginTop: 20,
              justifyContent: 'center',
            }}>
            <AppIconImage />
            <Text style={styles.text}>EResource</Text>
            <Text style={styles.bottomtext}>Messenger</Text>

            {/* <View style={{marginTop:'5%'}}>
                    <ActivityIndicator animating={true} size="large" color={BaseColor.ColorGreen} />
                    </View> */}
          </View>
          {/* </ImageBackground> */}
        </View>
      </LinearGradient>
    );
  }
}
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    // fontWeight: "bold",
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    // backgroundColor: "#000000a0"
  },
  bottomtext: {
    color: 'white',
    fontSize: 19,
    // fontWeight: "bold",
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    // backgroundColor: "#000000a0"
  },
});
