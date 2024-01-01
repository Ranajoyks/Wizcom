import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import {Root} from 'native-base';
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
    {key: 'second', title: 'Chat'},
    {key: 'third', title: 'Groups'},
  ];
}

export default class Singlechatpage extends BaseComponent<
  any,
  SinglechatpageViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new SinglechatpageViewModel());
  }
  renderScene = SceneMap({
    first: () => {
      console.log('Navigation Prop in Allmessage:', this.props.navigation);
      return <Allmessage navigation={this.props.navigation} />;
    },
    second: () => {
      console.log('Navigation Prop in Loginpage:', this.props.navigation);
      return <Allmessage navigation={this.props.navigation} />;
    },
    third: () => {
      console.log('Navigation Prop in Loginpage:', this.props.navigation);
      return <Groupchat navigation={this.props.navigation} />;
    },
  });

  //  MessageItem = ({ name }) => {
  //   return (
  //     <View style={styles.messageItem}>
  //       <Text style={styles.messageName}>{name}</Text>
  //     </View>
  //   );
  // };
  renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: 'black'}}
      style={{backgroundColor: 'white'}}
      renderLabel={({route, focused, color}) => (
        <Text style={{color: 'black', margin: 8}}>{route.title}</Text>
      )}
    />
  );
  initialLayout = {width: Dimensions.get('window').width};
  render() {
    var model = this.state.Model;
    return (
      <View style={styles.container}>
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
                Online:0
              </Text>
              <Text
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
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              /* Left icon action */
            }}>
            <Image
              source={require('../../assets/search.png')}
              style={{height: 30, width: 30, marginRight: 10}}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate({
                name: 'settingspage',
              });
              /* Right icon action */
            }}>
            <Image
              source={require('../../assets/settings.png')}
              style={{height: 30, width: 30, marginRight: 10}}
            />
            {/* <Icon name="bell" size={24} style={styles.icon} /> */}
          </TouchableOpacity>
        </View>
        {/* <View style={styles.tabsContainer}>
        <Text style={styles.tabButton}>All Messages</Text>
        <Text style={styles.tabButton}>Groups</Text>
      </View> */}
        {/* <NavigationContainer> */}
        <TabView
          renderTabBar={this.renderTabBar}
          navigationState={{
            index: model.index,
            routes: model.routes,
          }}
          renderScene={this.renderScene}
          onIndexChange={index => (model.index = index)}
          initialLayout={{width: Dimensions.get('window').width}}

          // tabBar={props => <View style={{ backgroundColor: 'white' }} {...props} /> as any}
        />
        <Text>Hello</Text>
        {/* </NavigationContainer> */}
        {/* <FlatList
        data={model.CityList}
        renderItem={({ item }) => (
          <View style={styles.messageItem}>
          <Text style={styles.messageName}>{item.name}</Text>
        </View>
          
        )}
        keyExtractor={(item) => item.id.toString()}
      /> */}
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
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    marginTop: 10,
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
});
