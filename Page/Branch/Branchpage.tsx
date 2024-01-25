import React, {Component} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import CustomPicker from '../../Control/CustomPicker';
import {Badge, Picker} from 'native-base';
import SessionHelper from '../../Core/SessionHelper';
import {Branch} from '../../Entity/Branch';
import axios from 'axios';
import * as signalR from '@microsoft/signalr';
export class BranchViewModel {
  BranchId: string = '';
  BranchList: any[] = [];
  BranchName: string = '';
  UserName: string = '';
  IsShow: boolean = false;
  ConnectionCode: any;
  AppVersion: string = '1.0.0';
  IsOpen: boolean = false;
  SenderID: any;
  URL: string = 'eiplutm.eresourceerp.com/AzaaleaR';
  FCMToken: string = '';
}
export default class Branchpage extends BaseComponent<any, BranchViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new BranchViewModel());
    this.state.Model.BranchList = props.route.params.BranchList;
    // this.state.Model.UserName = props.route.params.UserName;
    // console.log(this.state.Model.BranchList);
  }
  async componentDidMount(): Promise<void> {
    var Model = this.state.Model;
    var ConnectionCode = await SessionHelper.GetCompanyIDSession();
    var UserName = await SessionHelper.GetUserNameSession();
    var FCMTOKEN = await SessionHelper.GetFCMTokenSession();
    Model.FCMToken = FCMTOKEN
    this.UpdateViewModel()
    console.log('TokenFCM; ', FCMTOKEN);
    var URL = await SessionHelper.GetURLSession();
    if (URL) {
      Model.URL = URL;
      this.UpdateViewModel();
    }
    Model.UserName = UserName;
    Model.ConnectionCode = ConnectionCode;
    this.UpdateViewModel();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `${ConnectionCode}_${UserDetails.lId}`;
    Model.SenderID = myId;
    console.log("SenderID: ", myId);
    
  }
  SetCompany = async (event: any) => {
    var Model = this.state.Model;
    var value = await SessionHelper.GetSession();
    console.log('SessionValue: ', `ASP.NET_SessionId=${value}`);
    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    const CompanyCredential = {
      lCompId: event.value,
      lOffSet: '',
    };
    axios
      .post(
        `http://${Model.URL}/API/Sys/Sys.aspx/JOpnCmpny`,
        CompanyCredential,
        {headers: headers},
      )
      .then(res => {
        console.log('CompanyResponse: ', res.data.d);
        console.log(
          `ConnectionUser: ${Model.ConnectionCode}_${res.data.d.obj.lUsrId}`,
        );
        if (res.data.d.bStatus) {
          const Data = JSON.stringify({
            userId: `${Model.ConnectionCode}_${res.data.d.obj.lUsrId}`,
            url: `http://${Model.URL}`,
            session: value,
            code: Model.ConnectionCode,
          });
          console.log("UserSetData:",Data);
          
          axios
            .post(`https://wemessanger.azurewebsites.net/api/user/set`, Data, {
              headers: headers,
            })
            .then((setres: any) => {
              console.log('setresdata: ', setres.data);
              console.log(
                `ConnectionUser: ${Model.ConnectionCode}_${res.data.d.obj.lUsrId}`,
              );
              if (setres.data) {
                axios
                  .get(
                    `https://wemessanger.azurewebsites.net/api/user?userId=${Model.ConnectionCode}_${res.data.d.obj.lUsrId}`,
                  )
                  .then(response => {
                    console.log('LogIndata', response.data);
                    SessionHelper.SetUserDetailsSession(response.data[0]);
                    SessionHelper.SetUserIDSession(response.data[0].lId);
                    var Connection = new signalR.HubConnectionBuilder()
                      .withUrl(
                        `https://wemessanger.azurewebsites.net/chatHub?UserId=${
                          Model.ConnectionCode
                        }_${response.data[0].lId.toString()}`,
                      )
                      .build();
                    Connection.start().then(() => {
                      console.log('SignalR connected');
                      console.log('----', response.data[0].lId.toString());
                      Connection.invoke(
                        'JoinChat',
                        `${
                          Model.ConnectionCode
                        }_${response.data[0].lId.toString()}`,
                      ).then(res => {
                        Connection.invoke(
                          'IsUserConnected',
                          `${
                            Model.ConnectionCode
                          }_${response.data[0].lId.toString()}`,
                        )
                          .then(isConnected => {
                            console.log('Connection', isConnected);

                            if (isConnected) {
                              console.log(
                                `User: ${
                                  Model.ConnectionCode
                                }_${response.data[0].lId.toString()} is live`,
                              );
                            } else {
                              console.log(
                                `User:   ${
                                  Model.ConnectionCode
                                }_${response.data[0].lId.toString()} is not live`,
                              );
                            }
                          })
                          .catch(error => {
                            console.log(error);
                          });
                      });
                    });
                    if (response.data[0].lId) {
                      const SaveUserDevice = JSON.stringify({
                        userId: `${Model.ConnectionCode}_${response.data[0].lId}`,
                        deviceId: Model.FCMToken,
                      });
                      console.log("SaveUserDevice: ",SaveUserDevice);
                      
                      axios
                        .post(
                          `https://wemessanger.azurewebsites.net/api/user/device`,
                          SaveUserDevice,
                          {headers: headers},
                        )
                        .then(DeviceResponse => {
                          console.log('DeviceResponse: ', DeviceResponse.data);
                          if (DeviceResponse.data) {
                            this.props.navigation.navigate(
                              'Singlechatpage',
                              {},
                            );
                          }
                        })
                        .catch(err => {
                          console.log('DeviceResponseError: ', err);
                        });
                    }
                  })
                  .catch(err => {
                    console.log('UserError: ', err);
                  });
                //   this.props.navigation.navigate('Singlechatpage', {
                //     // BranchName: Branch.sName,
                //     // UserName: Model.UserName,
                //     // BranchID: Branch.lId,
                //   });
              }
            })
            .catch((err: any) => {
              console.log('Err: ', err);
            });
        }
      })
      .catch(err => {
        console.log('CompanyError: ', err);
      });
    console.log(Model.BranchList);
    console.log(event.value);
    var Branch: Branch = Model.BranchList.find(
      (i: Branch) => i?.lId === event.value,
    );
    console.log('BranchName', Branch);
    SessionHelper.SetBranchNameSession(Branch.sName);
    this.SetModelValue(event.name, event.value);
    // this.props.navigation.navigate('Singlechatpage', {
    //   // BranchName: Branch.sName,
    //   // UserName: Model.UserName,
    //   // BranchID: Branch.lId,
    // });
    SessionHelper.SetBranchIdSession(event.value);
  };
  Logout = () => {
    var Model = this.state.Model;
    SessionHelper.SetSession(null);
    SessionHelper.SetBranchIdSession(null);
    SessionHelper.SetDeviceIdSession(null);
    SessionHelper.SetSenderIdSession(null);
    SessionHelper.SetURLSession(null);
    SessionHelper.SetUserDetailsSession(null);
    SessionHelper.SetUserNameSession(null);
    this.props.navigation.reset({
      index: 0,
      routes: [{name: 'Selectcompanypage'}],
    });
    var Connection = new signalR.HubConnectionBuilder()
      .withUrl(
        `https://wemessanger.azurewebsites.net/chatHub?UserId=${Model.SenderID}`,
      )
      .build();
    Connection.start().then(() => {
      console.log('SignalR connected');
      Connection.invoke('DisconnectUser', Model.SenderID)
        .then((res: any) => {
          console.log('resDisconnect: ', res);
        })
        .catch((err: any) => {
          console.log('ErrorDisconnect: ', err);
        });
    });
  };
  DropDowmOpen = async () => {
    var Model = this.state.Model;
    Model.IsOpen = !Model.IsOpen;
    this.UpdateViewModel();
  };
  render() {
    var model = this.state.Model;
    var branchList = model.BranchList.map((i, k) => {
      return <Picker.Item label={i?.sName} key={k} value={i.lId} />;
    });
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              /* Left icon action */
            }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{height: 30, width: 30, marginLeft: 10}}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Branch</Text>
          <TouchableOpacity
            onPress={() => {
              this.DropDowmOpen();
            }}>
            <Badge
              style={{
                backgroundColor: '#E9E9E9',
                width: 35,
                height: 35,
                borderRadius: 50,
                // justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                marginTop: 0,
              }}>
              <Text
                style={{
                  color: 'black',
                  fontSize: 22,
                  fontWeight: '400',
                  fontFamily: 'OpenSans-Regular',
                }}>
                {model.UserName.toLocaleUpperCase().charAt(0)}
              </Text>
            </Badge>
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          {model.IsOpen == true && (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdown}>
                <View>
                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',
                        alignSelf: 'left',
                        fontSize: 12,
                      }}>
                      User:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'left',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {model.UserName}
                    </Text>
                  </View>
                  <View style={styles.divider}></View>
                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',
                        alignSelf: 'left',
                        fontSize: 12,
                      }}>
                      Designation:
                    </Text>
                  </View>
                  <View style={styles.divider}></View>
                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',
                        alignSelf: 'left',
                        fontSize: 12,
                      }}>
                      Connection Code:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'left',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {model.ConnectionCode}
                    </Text>
                  </View>
                  <View style={styles.divider}></View>

                  <View style={{}}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',
                        alignSelf: 'left',
                        fontSize: 12,
                      }}>
                      Version:
                    </Text>
                    <Text
                      style={{
                        paddingLeft: 20,
                        color: 'black',
                        alignSelf: 'left',
                        fontSize: 12,
                        fontFamily: 'OpenSans-SemiBold',
                      }}>
                      {model.AppVersion}
                    </Text>
                  </View>
                  <View style={styles.divider}></View>
                  <TouchableOpacity onPress={() => this.Logout()}>
                    <Text
                      style={{
                        fontFamily: 'OpenSans-SemiBold',
                        marginTop: 15,
                        paddingLeft: 20,
                        color: '#0383FA',
                        alignSelf: 'left',
                        fontSize: 12,
                        marginBottom: 20,
                      }}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
          <Text style={styles.text}>Please select your branch</Text>
          {/* <Text style={styles.text2}>Select Company</Text> */}
          <CustomPicker
            Name="BranchId"
            LabelText="Select Branch"
            selectedValue={model.BranchId}
            onValueChange={this.SetCompany}
            Data={branchList}
            IsNullable={true}
          />
          {/* </Button> */}
        </View>
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
  divider: {
    height: 1,
    backgroundColor: 'gray',
    marginHorizontal: 20,
    marginTop: 12,
    opacity: 0.5,
  },
  dropdownContainer: {
    position: 'absolute',
    top: -10,
    right: 20,
    // Set a height for the container
    height: 'auto',
    width: 200,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: '#f1f1f1',
    color: 'black',
    borderRadius: 10,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 1000,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginBottom: 20,
  },
  text2: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 30,
    letterSpacing: 1.2,
  },

  input: {
    alignSelf: 'center',
    width: '95%',
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    marginBottom: 10,
    borderRadius: 7,
  },
  buttontest: {
    alignSelf: 'center',
    marginTop: '90%',
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,

    // padding: 10,
    width: '95%',
  },
});
