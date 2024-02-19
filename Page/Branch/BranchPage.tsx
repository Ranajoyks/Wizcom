import React, { } from 'react';
import { View, StyleSheet } from 'react-native';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';


import SessionHelper from '../../Core/SessionHelper';
import { Branch } from '../../Entity/Branch';

import { BaseProps, mapDispatchToProps } from '../../Core/BaseProps';
import ERESApi from '../../DataAccess/ERESApi';
import BaseApi from '../../DataAccess/BaseApi';
import SignalRApi from '../../DataAccess/SignalRApi';

import { Picker } from '@react-native-picker/picker';
import { Text } from 'react-native-paper';
import { connect } from 'react-redux';
import { styles } from '../MainStyle';
import { MHeader } from '../../Control/MHeader';
import { SafeAreaView } from 'react-native-safe-area-context';

import UIHelper from '../../Core/UIHelper';
import { SignalRHubConnection } from '../../DataAccess/SignalRHubConnection';
import MPicker from '../../Control/MPicker';


export class BranchPageViewModel {
  Branch?: Branch;
  BranchList: Branch[] = [];

}
export class BranchPage extends BaseComponent<"BranchPage", BranchPageViewModel> {
  constructor(props: BaseProps<'BranchPage'>) {
    super(props);
    this.state = new BaseState(new BranchPageViewModel());
    this.state.Model.BranchList = props.route.params.BranchList;
  }



  SetCompany = async (value: Branch) => {
    //console.log("SetCompany", value)
    var Model = this.state.Model;
    Model.Branch = value
    this.UpdateViewModel()


    if (!value) {
      return
    }

    SessionHelper.SetBranch(value);

    this.ShowPageLoader(true)
    const CompanyCredential = {
      lCompId: value.lId,
      lOffSet: '',
    };
    UIHelper.LogTime("JOpnCmpny", "Start")
    var companyRes = await ERESApi.JOpnCmpny(CompanyCredential)
    UIHelper.LogTime("JOpnCmpny", "End")
    if (companyRes.IsKSError || !companyRes.data) {
      this.ShowToast(companyRes.ErrorInfo!)
      this.ShowPageLoader(false)
      return
    }

    var CompanyID = await SessionHelper.GetCompanyID()
    var chatId = await UIHelper.GetChatId(companyRes.data.d.obj.lUsrId)
    //var chatId = `${CompanyID}_${companyRes.data.d.obj.lUsrId}`
    await SessionHelper.SetChatId(chatId)


    // var tempUrl = (await BaseApi.getFinalUrl("ERES", "", false)).replace("/api", "")

    // const Data = JSON.stringify({
    //   userId: chatId,
    //   url: tempUrl,
    //   session: await SessionHelper.GetSessionId(),
    //   code: CompanyID,
    // });

    UIHelper.LogTime("UserSetDetail", "Start")
    var isValidUserSetDetail = await SignalRApi.UserSetDetail()
    UIHelper.LogTime("UserSetDetail", "End")
    if (isValidUserSetDetail.IsKSError || !isValidUserSetDetail.data) {
      this.ShowPageLoader(false)
      this.ShowToast(companyRes.ErrorInfo || "User not validated")
      return
    }
    UIHelper.LogTime("ConectUser", "Start")
    var connectResponse = await SignalRApi.ConectUser(chatId)
    UIHelper.LogTime("ConectUser", "End")
    if (connectResponse.IsKSError || !connectResponse.data) {
      this.ShowToast(connectResponse.ErrorInfo!)
      this.ShowPageLoader(false)
      return
    }

    SessionHelper.SetUserDetails(connectResponse.data[0]);
    UIHelper.LogTime("JoinChat", "Start")
    await SignalRHubConnection.JoinChat(chatId)
    UIHelper.LogTime("JoinChat", "End")
    UIHelper.LogTime("IsConnected", "Start")
    var IsConnected = await SignalRHubConnection.IsConnected()
    UIHelper.LogTime("IsConnected ", "End")

    if (!IsConnected) {
      this.ShowPageLoader(false)
      this.ShowToast("User not connected " + IsConnected)
      return
    }
    const SaveUserDevice = JSON.stringify({
      userId: chatId,
      deviceId: await SessionHelper.GetFCMToken(),
    });
    UIHelper.LogTime("UserSetDevice", "Start")
    var deviceRespose = await SignalRApi.UserSetDevice(SaveUserDevice)
    this.ShowPageLoader(false)
    if (!deviceRespose) {
      this.ShowPageLoader(false)
      this.ShowToast(SignalRHubConnection.connectionErrorMessage)
      return
    }
    UIHelper.LogTime("UserSetDevice", "End")
    this.props.navigation.reset(
      {
        index: 0,
        routes: [{ name: 'MainPage' }],
      }
    )
  }

  render() {
    var model = this.state.Model
    return (
      <SafeAreaView style={styles.container} >
        <MHeader Title='Branch' RightSideIcon='UserProfile' />

        <View style={{ marginTop: 30 }}>

          <Text style={localStyles.text}>Please select your branch</Text>
          <MPicker
            Data={model.BranchList}
            Label='sName'
            Value='lId'
            AddPlaceHolderItem='Select Branch'
            selectedValue={model.Branch}
            onValueChange={(itemValue, itemIndex) => {
              this.SetCompany(itemValue)
            }
            }>
          </MPicker>
        </View>
      </SafeAreaView >
    );
  }
}


var connector = connect(null, mapDispatchToProps)(BranchPage);
export default connector

const localStyles = StyleSheet.create({



  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginBottom: 20,
  },

});