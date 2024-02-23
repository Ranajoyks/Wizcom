import React from 'react';
import { View, StatusBar, StyleSheet, Text } from 'react-native';
import AppIconImage from '../../assets/AppIconImage';

import BaseColor from '../../Core/BaseTheme';
import LinearGradient from 'react-native-linear-gradient';

import SessionHelper from '../../Core/SessionHelper';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import { BaseProps, mapDispatchToProps } from '../../Core/BaseProps';
import BaseViewModel from '../../Core/BaseViewModel';
import SignalRApi from '../../DataAccess/SignalRApi';
import ERESApi from '../../DataAccess/ERESApi';
import BaseApi from '../../DataAccess/BaseApi';
import { connect } from 'react-redux';
import { SignalRHubConnection } from '../../DataAccess/SignalRHubConnection';
import UIHelper from '../../Core/UIHelper';

export class SplashPage extends BaseComponent<'SplashPage', BaseViewModel> {
  constructor(props: BaseProps<'SplashPage'>) {
    super(props);
    this.state = new BaseState(new BaseViewModel());
  }
  async componentDidMount() {
    setTimeout(async () => {
      var ChatId = await SessionHelper.GetChatId();

      if (ChatId) {
        this.RedirectToMainScreen(ChatId);
        return;
      }

      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'CompanySelectionPage' }],
      });
    }, 100);
  }
  RedirectToMainScreen = async (ChatId: string) => {
    var companyID = await SessionHelper.GetCompanyID();

    var FMCToken = await SessionHelper.GetFCMToken();
    var userInfo = await SessionHelper.GetUserDetails();
    var Branch = await SessionHelper.GetBranch();

    // const Data = JSON.stringify({
    //   userId: ChatId,
    //   url: BaseApi.BaseUrlEresourceerp,
    //   session: SessionId,
    //   code: companyID,
    // });

    var userRes = await SignalRApi.UserSetDetail();

    if (userRes.IsKSError || !userRes.data) {
      this.ShowToast(userRes.ErrorInfo!);
      return;
    }

    const SaveUserDevice = JSON.stringify({
      userId: ChatId,
      deviceId: FMCToken,
    });
    console.log('SaveUserDevice: ', SaveUserDevice);
    const AutologinData = {
      sConn: `${companyID}`,
      dOffSet: new Date().getTimezoneOffset(),
      cPlatForm: 'M',
      lUsrId: userInfo!.lId,
      lCompId: Branch!.lId,
    };
    console.log('AutologinData: ', AutologinData);

    var DeviceResponse = await SignalRApi.UserSetDevice(SaveUserDevice);

    if (!DeviceResponse) {
      return;
    }

    await SignalRHubConnection.JoinChat(ChatId);
    UIHelper.LogTime('JoinChat', 'End');

    var SessionResponse = await ERESApi.JCheckSession();
    if (SessionResponse.IsKSError || !SessionResponse.data) {
      this.ShowToast(SessionResponse.ErrorInfo!);
      return;
    }

    if (SessionResponse.data.d.bStatus) {
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'MainPage' }],
      });
    }
    if (!SessionResponse.data.d.bStatus) {
      var AutoLoginresponse = await ERESApi.JAutoLogin(AutologinData);
      if (AutoLoginresponse.data.d.bStatus) {
        this.props.navigation.reset({
          index: 0,
          routes: [{ name: 'MainPage' }],
        });
      }
      if (!AutoLoginresponse.data.d.bStatus) {
        this.props.navigation.reset({
          index: 0,
          routes: [{ name: 'CompanySelectionPage' }],
        });
      }
    }
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

var connector = connect(null, mapDispatchToProps)(SplashPage);
export default connector;
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
