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
  componentDidMount() {
    this.Fetchmessage();
  }
  Fetchmessage = async () => {
    var UserName = await SessionHelper.GetUserNameSession();
    var model = this.state.Model;
    axios
      .get('https://wemessanger.azurewebsites.net/api/user')
      .then(response => {
        // console.log('data', response.data);
        model.alluser = response.data;
        var Find = response.data.find((i: any) => i.userName == UserName);
        model.SenderId = Find.lId;
        this.UpdateViewModel();
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };
  NextPage = (user: alluser) => {
    var Model = this.state.Model;
    this.props.navigation.navigate(
      'Chatdetails',
      {
        User: user,
        SenderID: Model.SenderId,
      },
    );
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
                        fontFamily: 'Poppins-Regular',
                        marginBottom: 5,
                      }}>
                      {i.userFullName}
                    </Text>
                    <Text
                      style={{
                        color: '#0383FA',
                        fontWeight: '200',
                        fontFamily: 'Poppins-Regular',
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
