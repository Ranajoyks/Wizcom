import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {Badge, Root} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import Selectcompanypage from '../Company/Selectcompanypage';
import Loginpage from '../Login/Loginpage';
import Icon from 'react-native-vector-icons/FontAwesome';
import Allmessage from './Allmessage';
import {NavigationContainer} from '@react-navigation/native';
import Groupchat from './Groupchat';

export class SinglechatpageViewModel {
  BranchName: string = '';
  UserName: string = '';
  IsShow: boolean = false;
  Message: string = '';

  CityList: any[] = [
    {id: 1, name: 'Aaron Loeb'},
    {id: 2, name: 'Adeline Palmerston'},
    {id: 3, name: 'Daniel Gallego'},
    {id: 4, name: 'Juliana Sive'},
    {id: 5, name: 'Redro Femandes'},
    {id: 6, name: 'Korina Villanueva'},
    // Add more companies
  ];
  index: number = 0;
  routes: any[] = [
    {key: 'first', title: 'All Messages'},
    // {key: 'second', title: 'Chat'},
    {key: 'second', title: 'Notification'},
  ];
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
  Search = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;
    this.UpdateViewModel();
  };
  Cancle = async () => {
    var Model = this.state.Model;
    Model.IsShow = !Model.IsShow;
    this.UpdateViewModel();
  };
  renderScene = SceneMap({
    first: () => {
      // console.log('Navigation Prop in Allmessage:', this.props.navigation);
      return <Allmessage navigation={this.props.navigation} />;
    },
    second: () => {
      // console.log('Navigation Prop in Loginpage:', this.props.navigation);
      return <Allmessage navigation={this.props.navigation} />;
    },
    // third: () => {
    //   // console.log('Navigation Prop in Loginpage:', this.props.navigation);
    //   return <Groupchat navigation={this.props.navigation} />;
    // },
  });
  renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: 'black'}}
      style={{backgroundColor: 'white'}}
      renderLabel={({route, focused, color}) => (
        <Text style={{color: 'black', marginBottom: 8,marginHorizontal:8}}>{route.title}</Text>
      )}
    />
  );
  initialLayout = {width: Dimensions.get('window').width};
  render() {
    var model = this.state.Model;
    return (
      <View style={styles.container}>
        {model.IsShow == false && (
          <View style={styles.header}>
            <View>
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
                {/* <Text
                style={{
                  fontSize: 16,
                  fontWeight: '200',
                  fontFamily: 'Poppins-Regular',
                  color: 'black',
                  marginRight: 8,
                }}>
                Offline:0
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '200',
                  fontFamily: 'Poppins-Regular',
                  color: 'black',
                  marginRight: 8,
                }}>
                All:0
              </Text> */}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                this.Search();
              }}>
              <Image
                source={require('../../assets/search.png')}
                style={{height: 30, width: 30, marginRight: 10}}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                /* Right icon action */
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
                  {model.UserName.charAt(0)}
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
                onChangeText={text => {
                  model.Message = text;
                  this.UpdateViewModel();
                }}
                style={
                  (styles.input, {width: Dimensions.get('window').width - 70})
                }
                placeholder="Search....."></TextInput>
              <TouchableOpacity
                onPress={this.Cancle}
                style={{flexShrink: 1, width: 25, justifyContent: 'center'}}>
                <Image
                  source={require('../../assets/cancel.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <TabView
          renderTabBar={this.renderTabBar}
          navigationState={{
            index: model.index,
            routes: model.routes,
          }}
          renderScene={this.renderScene}
          onIndexChange={index => (model.index = index)}
          initialLayout={{width: Dimensions.get('window').width}}
        />
      </View>
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
  header: {
    backgroundColor: '#FFFFFF', // Lighter blue header
    paddingTop: 10,
    paddingHorizontal:15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // marginTop:10
  },
  headerTitle: {
    color: '#fff', // Replace with desired text color
    fontSize: 20, // Adjust font size as needed
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
});
