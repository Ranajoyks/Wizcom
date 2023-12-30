import React, {Component} from 'react';
import {Text, View} from 'react-native';

import {
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

// const navigation = useNavigation();
export class GroupchatViewModel {}

export default class Groupchat extends BaseComponent<any, GroupchatViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new GroupchatViewModel());
  }
  NextPage = () => {
    console.log('Button Pressed!');
    this.props.navigation.navigate({
      name: 'Chatdetails',
    });
    // navigation.navigate('Chatdetails');
  };
  render() {
    console.log('prop', this.props);
    // const { navigation } = this.props;
    return (
      <Container>
        <Content>
          <List>
            <TouchableOpacity onPress={this.NextPage}>
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
            </TouchableOpacity>
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
            </ListItem>
          </List>
        </Content>
      </Container>
    );
  }
}
