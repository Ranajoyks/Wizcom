import React, {Component} from 'react';
import {Text, View} from 'react-native';

import {
  Badge,
  Body,
  Container,
  Content,
  Left,
  List,
  ListItem,
  Right,
  Root,
  Thumbnail,
} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import {TouchableOpacity} from 'react-native-gesture-handler';
import axios from 'axios';
import alluser from '../../Entity/alluser';
import SessionHelper from '../../Core/SessionHelper';
import DeviceInfo from 'react-native-device-info';
import * as signalR from '@microsoft/signalr';
import messaging from '@react-native-firebase/messaging';

// const navigation = useNavigation();
export class allchatpageViewModel {
  alluser: alluser[] = [];
  UserName: string = '';
  SenderId?: number;
  Sender: any;
}

export default class Allmessage extends BaseComponent<
  any,
  allchatpageViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new allchatpageViewModel());
  }
  async componentDidMount() {
    this.Fetchmessage();
    const FCM = await messaging().getToken();
    console.log('FCM', FCM);
    if (FCM) {
      console.log('FCM', FCM);
    }
  }
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
      Connection.invoke('GetAllUser', myId, 0)
        .then(user => {
          // console.log(user);
          model.alluser = user;
          this.UpdateViewModel();
        })
        .catch((err: any) => {
          console.log('Error to invoke: ', err);
        });
    });
  };
  NextPage = (user: alluser) => {
    var Model = this.state.Model;
    this.props.navigation.navigate('Chatdetails', {
      User: user,
      // SenderID: Model.SenderId,
    });
    // console.log("ModelSenderID: ",Model.SenderId,);
  };
  render() {
    var model = this.state.Model;
    return (
      <Container>
        {/* <Header /> */}
        <Content>
          <List>
            {model.alluser.map((i: alluser) => (
              <TouchableOpacity onPress={() => this.NextPage(i)}>
                <ListItem avatar>
                  <Left>
                    {/* <Thumbnail
                    source={{
                      uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg',
                    }}
                    style={{height: 40, width: 40}}
                  /> */}
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

            {/* <ListItem avatar>
              <Left>
                <Thumbnail
                  source={{
                    uri: 'https://th.bing.com/th/id/OIP.6a7hLDHlrsA0-vzMrABZ2AHaIT?w=164&h=184&c=7&r=0&o=5&pid=1.7',
                  }}
                  style={{height: 40, width: 40}}
                />
              </Left>
              <Body>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    fontFamily: 'Poppins-Regular',
                    marginBottom: 5,
                  }}>
                  Joun Doe
                </Text>
                <Text
                  style={{
                    color: '#0383FA',
                    fontWeight: '200',
                    fontFamily: 'Poppins-Regular',
                    fontSize: 12,
                  }}>
                  Thank You
                </Text>
              </Body>
              <Right></Right>
            </ListItem>
            <ListItem avatar>
              <Left>
                <Thumbnail
                  source={{
                    uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg',
                  }}
                  style={{height: 40, width: 40}}
                />
              </Left>
              <Body>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    fontFamily: 'Poppins-Regular',
                    marginBottom: 5,
                  }}>
                  XYZ Group
                </Text>
                <Text
                  style={{
                    color: '#0383FA',
                    fontWeight: '200',
                    fontFamily: 'Poppins-Regular',
                    fontSize: 12,
                  }}>
                  Hey Everyone
                </Text>
              </Body>
              <Right></Right>
            </ListItem>
            <ListItem avatar>
              <Left>
                <Thumbnail
                  source={{
                    uri: 'https://th.bing.com/th/id/OIP.6a7hLDHlrsA0-vzMrABZ2AHaIT?w=164&h=184&c=7&r=0&o=5&pid=1.7',
                  }}
                  style={{height: 40, width: 40}}
                />
              </Left>
              <Body>
                <Text
                  style={{
                    color: 'black',
                    fontWeight: '600',
                    fontFamily: 'Poppins-Regular',
                    marginBottom: 5,
                  }}>
                  ABC Group
                </Text>
                <Text
                  style={{
                    color: '#0383FA',
                    fontWeight: '200',
                    fontFamily: 'Poppins-Regular',
                    fontSize: 12,
                  }}>
                  Thank You
                </Text>
              </Body>
              <Right></Right>
            </ListItem> */}
          </List>
        </Content>
      </Container>
    );
  }
}
