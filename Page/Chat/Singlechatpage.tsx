import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
  TextInput,
} from 'react-native';
import {
  Badge,
  Body,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Root,
  Container,
  Header,
  Tab,
  Tabs,
  TabHeading,
} from 'native-base';
// import { TabHeading} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Selectcompanypage from '../Company/Selectcompanypage';
import Loginpage from '../Login/Loginpage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Allmessage from './Allmessage';
import {NavigationContainer} from '@react-navigation/native';
import Groupchat from './Groupchat';
import SessionHelper from '../../Core/SessionHelper';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import alluser from '../../Entity/alluser';
import {TouchableOpacity} from 'react-native-gesture-handler';

export class SinglechatpageViewModel {
  BranchName: string = '';
  UserName: string = '';
  IsShow: boolean = false;
  Message: string = '';
  IsOpen: boolean = false;
  DeviceId: string = '';
  AppVersion: string = '1.0.0';
  OnlineText: string = 'Users Online';
  alluser: alluser[] = [];
  index: number = 0;
  FilterUser: alluser[] = [];
}

export default class Singlechatpage extends BaseComponent<
  any,
  SinglechatpageViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new SinglechatpageViewModel());
    this.state.Model.BranchName = props.route.params.BranchName;
    this.state.Model.UserName = props.route.params.UserName;
    console.log('Branch', this.state.Model.BranchName);
  }
  async componentDidMount() {
    var Model = this.state.Model;
    const deviceId = DeviceInfo.getDeviceId();
    Model.DeviceId = deviceId;
    this.UpdateViewModel();
    console.log('deviceId: ', deviceId);
    var User = await SessionHelper.GetUserDetailsSession();
    console.log('User: ', User);
    console.log('User: ', Model.UserName);
    this.Fetchmessage();
    setInterval(this.Fetchmessage, 120000);
  }
  Search = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;

    this.UpdateViewModel();
  };
  Cancle = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;
    Model.Message = '';
    Model.FilterUser = Model.alluser;
    this.UpdateViewModel();
  };
  DropDowmOpen = async () => {
    var Model = this.state.Model;
    Model.IsOpen = !Model.IsOpen;
    this.UpdateViewModel();
  };
  handleSelection = async (option: any) => {
    console.log(option);
  };
  Fetchmessage = async () => {
    var model = this.state.Model;
    var UserName = await SessionHelper.GetUserNameSession();
    var UserDetails = await SessionHelper.GetUserDetailsSession();
    var myId = `u_${UserDetails.lId}`;
    const deviceId = DeviceInfo.getDeviceId();
    var Connection = new signalR.HubConnectionBuilder()
      .withUrl('https://wemessanger.azurewebsites.net/chatHub')
      .build();
    Connection.start().then(() => {
      console.log('SignalR connected');

      var UserList = Connection.invoke('GetAllUser', myId, 0)
        .then(user => {
          // console.log(user);
          model.alluser = user;
          model.FilterUser = model.alluser;
          this.UpdateViewModel();
        })
        .catch((err: any) => {
          console.log('Error to invoke: ', err);
        });
    });
  };
  NextPage = (user: alluser) => {
    console.log('Hi');

    var Model = this.state.Model;
    this.props.navigation.navigate('Chatdetails', {
      User: user,
      // SenderID: Model.SenderId,
    });
    // console.log("ModelSenderID: ",Model.SenderId,);
  };
  UserOnline = () => {
    var Model = this.state.Model;
    console.log(Model.alluser);
    if ((Model.OnlineText = 'Users Online')) {
      var UserOnline = Model.alluser.filter(
        (i: alluser) => i.isUserLive === true,
      );
      console.log('Hi');
      console.log('UserOnline', UserOnline);
      if (UserOnline) {
        Model.FilterUser = UserOnline;
        Model.OnlineText = 'All User';
        this.UpdateViewModel();
      }
    }
  };
  AllUserss = () => {
    var Model = this.state.Model;
    Model.OnlineText = 'Users Online';
    console.log('Model.user', Model.alluser);
    Model.FilterUser = Model.alluser;
    this.UpdateViewModel();
  };
  SearchText = (text: string) => {
    var Model = this.state.Model;
    Model.Message = text;
    var NewArray = Model.alluser.filter((i: alluser) => {
      const itemData = `${i.userName.toLowerCase()}`;
      const textData = text.toLowerCase();
      if (textData.toLowerCase()) {
        return itemData.indexOf(textData) > -1;
      }
    });
    console.log('NewArray', NewArray);
    if (NewArray) {
      Model.FilterUser = NewArray;
      this.UpdateViewModel();
    }
    if (text == '') {
      console.log('Hii');
      Model.FilterUser = Model.alluser;
      this.UpdateViewModel();
    }
  };
  Logout=()=>{
SessionHelper.SetBranchIdSession(null)
SessionHelper.SetDeviceIdSession(null)
SessionHelper.SetSenderIdSession(null)
SessionHelper.SetURLSession(null)
SessionHelper.SetUserDetailsSession(null)
SessionHelper.SetUserNameSession(null)
this.props.navigation.reset({
  index: 0,
  routes: [{ name: 'Loginpage' }],
});
  }

  initialLayout = {width: Dimensions.get('window').width};
  render() {
    var model = this.state.Model;
    // console.log('FilterUser: ', model.FilterUser);

    return (
      <Container>
        <View style={styles.container}>
          {model.IsShow == false && (
            <View style={styles.header}>
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '800',
                    fontFamily: 'Poppins-Regular',
                    color: 'black',
                  }}>
                  EResource Messenger
                </Text>
                <View style={{flexDirection: 'row', marginTop: 5}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '100',
                      fontFamily: 'Poppins-Regular',
                      color: '#0383FA',
                      marginRight: 8,
                    }}>
                    {model.BranchName}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{width: 25, paddingRight: 40, marginTop: -5}}
                onPress={() => {
                  this.Search();
                }}>
                <Image
                  source={require('../../assets/search.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{marginTop: -5}}
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
                    marginTop: -5,
                  }}>
                  <Text
                    style={{
                      color: 'black',
                      fontSize: 22,
                      fontWeight: '400',
                    }}>
                    {model.UserName.toLocaleUpperCase().charAt(0)}
                  </Text>
                </Badge>
                {/* <Icon name="bell" size={24} style={styles.icon} /> */}
              </TouchableOpacity>
            </View>
          )}
          {model.IsShow == true && (
            <View style={{padding: 10}}>
              <View
                style={{
                  backgroundColor: '#F1F1F1',
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 6,
                  flexDirection: 'row',
                }}>
                <TextInput
                  value={model.Message}
                  onChangeText={text => this.SearchText(text)}
                  style={
                    (styles.input, {width: Dimensions.get('window').width - 70})
                  }
                  placeholder="Search....."></TextInput>
                <TouchableOpacity
                  onPress={this.Cancle}
                  style={{
                    flexShrink: 1,
                    width: 25,
                    justifyContent: 'center',
                    marginTop: 11,
                  }}>
                  <Image
                    source={require('../../assets/cancel.png')}
                    style={{height: 25, width: 25}}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {model.IsOpen == true && (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdown}>
                <View>
                <View>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    User:
                  </Text>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:10,
                      paddingTop:0,
                      color: 'black',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:16
                    }}>
                    {model.UserName}
                  </Text>
                  </View>
                  <View>
                  <Text
                     style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    Designation:
                  </Text>
                  </View>
                  <View style={{}}>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    Connection Code:
                  </Text>
                  </View>
                  <View style={{}}>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:1,
                      paddingTop:10,
                      color: '#0383FA',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:12
                    }}>
                    Version:
                  </Text>
                  <Text
                    style={{
                      padding: 20,
                      paddingBottom:10,
                      paddingTop:0,
                      color: 'black',
                      // margin: 10,
                      alignSelf: 'left',
                      fontSize:16
                    }}>
                    {model.AppVersion}
                  </Text>
                  </View>
                  {model.OnlineText == 'Users Online' ? (
                    <TouchableOpacity onPress={() => this.UserOnline()}>
                      <Text
                        style={{
                          padding: 20,
                          paddingBottom:1,
                          paddingTop:10,
                          color: '#0383FA',
                          // margin: 10,
                          alignSelf: 'left',
                        }}>
                        {model.OnlineText}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => this.AllUserss()}>
                      <Text
                        style={{
                          padding: 20,
                          paddingBottom:1,
                          paddingTop:10,
                          color: '#0383FA',
                          // margin: 10,
                          alignSelf: 'left',
                        }}>
                        {model.OnlineText}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => this.Logout()}>
                    <Text
                      style={{
                        padding: 20,
                        paddingBottom:1,
                        paddingTop:10,
                        color: '#0383FA',
                        // margin: 10,
                        alignSelf: 'left',
                      }}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          <Tabs
            tabBarUnderlineStyle={{
              borderColor: 'white',
              backgroundColor: 'black',
              borderWidth: 0.5,
              height: 0,
            }}
            tabContainerStyle={{
              borderColor: 'white',
            }}>
            <Tab
              heading="AllMessage"
              color="black"
              textStyle={{color: 'black'}}
              activeTextStyle={{color: 'black'}}
              tabContainerStyle={{backgroundColor: 'white'}}
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white', borderColor: 'white'}}>
              <Content>
                <List>
                  {model.FilterUser.map((i: alluser) => (
                    <TouchableOpacity onPress={() => this.NextPage(i)}>
                      <ListItem avatar>
                        <Left>
                          <View>
                            <Badge
                              style={{
                                backgroundColor: '#E9E9E9',
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                              <Text
                                style={{
                                  color: 'black',
                                  fontSize: 22,
                                  fontWeight: '400',
                                }}>
                                {i.userFullName.toLocaleUpperCase().charAt(0)}
                              </Text>
                            </Badge>
                            {i?.isUserLive ? (
                              <View style={styles.circle}></View>
                            ) : (
                              <View style={styles.circle2}></View>
                            )}
                          </View>
                        </Left>
                        <Body>
                          <View style={{flexDirection: 'row'}}>
                            <Text
                              style={{
                                color: 'black',
                                fontWeight: '600',
                                fontFamily: 'OpenSans-VariableFont_wdth,wght',
                                marginBottom: 5,
                                fontSize: 14.5,
                              }}>
                              {i.userFullName}
                            </Text>
                          </View>
                          <Text
                            style={{
                              color: i.status ? '#0383FA' : '#a6a6a6',
                              fontWeight: '200',
                              fontFamily: 'OpenSans-VariableFont_wdth,wght',
                              fontSize: 12,
                            }}>
                            {i.message ? i.message : 'No message'}
                          </Text>
                        </Body>
                        <Right></Right>
                      </ListItem>
                    </TouchableOpacity>
                  ))}
                </List>
              </Content>
            </Tab>
            <Tab
              heading="Notification"
              color="black"
              textStyle={{color: 'black'}}
              activeTextStyle={{color: 'black'}}
              tabContainerStyle={{backgroundColor: 'white'}}
              tabStyle={{backgroundColor: 'white'}}
              activeTabStyle={{backgroundColor: 'white'}}>
              <Content>
                {/* <List>
                  {model.alluser.map((i: alluser) => (
                    <TouchableOpacity onPress={() => this.NextPage(i)}>
                      <ListItem avatar>
                        <Left>
                          <Badge
                            style={{
                              backgroundColor: '#E9E9E9',
                              width: 50,
                              height: 50,
                              borderRadius: 25,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}>
                            <Text
                              style={{
                                color: 'black',
                                fontSize: 22,
                                fontWeight: '400',
                              }}>
                              {i.userFullName.charAt(0)}
                            </Text>
                          </Badge>
                        </Left>
                        <Body>
                          <Text
                            style={{
                              color: 'black',
                              fontWeight: '600',
                              fontFamily: 'OpenSans-VariableFont_wdth,wght',
                              marginBottom: 5,
                            }}>
                            {i.userFullName}
                          </Text>
                          <Text
                            style={{
                              color: i.status ? '#0383FA' : '#a6a6a6',
                              fontWeight: '200',
                              fontFamily: 'OpenSans-VariableFont_wdth,wght',
                              fontSize: 12,
                            }}>
                            {i.message ? i.message : 'No message'}
                          </Text>
                        </Body>
                        <Right></Right>
                      </ListItem>
                    </TouchableOpacity>
                  ))}
                </List> */}
              </Content>
            </Tab>
          </Tabs>
        </View>
      </Container>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF', // Replace with desired background color
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Poppins-Regular',
    color: 'black', // Darker blue title
  },
  dropdownContainer: {
    position: 'absolute',
    top: 60,
    right: 10,
    // Set a height for the container
    height: 'auto',
    width: 200,
    zIndex: 1,
  },
  dropdown: {
    backgroundColor: '#f1f1f1',
    color: 'black',
    borderRadius: 10,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    paddingTop: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop:10
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBar: {
    color: '#fff', // Replace with desired text color
    fontSize: 16, // Adjust font size as needed
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    // marginTop: 10,
  },
  tabButton: {
    padding: 10,
    backgroundColor: '#ddd', // Replace with desired tab background color
  },
  messageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee', // Adjust border color as needed
  },
  messageName: {
    fontSize: 18, // Adjust font size as needed
  },
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 30,
    marginTop: 6,
    marginLeft: 4,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 1,
  },
  circle2: {
    width: 10,
    height: 10,
    borderRadius: 30,
    marginTop: 6,
    marginLeft: 4,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 5,
    right: 1,
  },
});
