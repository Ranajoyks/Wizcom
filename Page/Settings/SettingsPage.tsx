import React, { Component } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import SessionHelper from '../../Core/SessionHelper';
import { Button } from 'react-native-paper';

export class SettingsViewModel {
  URL: string = 'eipl.eresourceerp.com';
}
export default class SettingsPage extends BaseComponent<
  "SettingsPage",
  SettingsViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new SettingsViewModel());
  }
  async componentDidMount() {
    var Model = this.state.Model;
    var URL = await SessionHelper.GetURL();
    if (URL) {
      Model.URL = URL;
      this.UpdateViewModel();
    }
  }
  handleSetUrl = () => {
    var Model = this.state.Model;
    console.log('URL: ', Model.URL);
    SessionHelper.SetURL(Model.URL);
    this.props.navigation.push('CompanySelectionPage');

    // Handle setting the URL here, e.g., store it in a state or send it to a server
  };
  render() {
    var Model = this.state.Model;
    // const {url} = this.state;
    const prefix = 'http://';
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              /* Left icon action */
            }}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ height: 30, width: 30, marginLeft: 10 }}
            />
            {/* <AppIconImage style={
            {height:30,width:30}
          }/> */}
            {/* <Icon name="bars" size={24} style={styles.icon} /> */}
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity
            onPress={() => {
              /* Right icon action */
            }}>
            <Image
              source={require('../../assets/settings.png')}
              style={{ height: 30, width: 30, marginRight: 10 }}
            />
            {/* <Icon name="bell" size={24} style={styles.icon} /> */}
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.text}>Please enter url of server</Text>
          <Text style={styles.text2}>ENTER URL</Text>
          <TextInput
            style={styles.input}
            placeholder="ENTER URL"
            value={Model.URL} // Concatenate prefix with the value
            onChangeText={(text) => {
              Model.URL = text
              this.UpdateViewModel()
            }}
          />

          {/* <Button textStyl="Set URL"  onPress={this.handleSetUrl}   /> */}
        </View>
        <Button onPress={this.handleSetUrl} style={styles.buttontest}>
          <Text
            style={{
              color: 'white',
              fontWeight: '800',
              fontFamily: 'Poppins-Regular',
            }}>
            Set URL
          </Text>
        </Button>
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
  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
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
    // marginTop:10,
    // marginBottom: 5,
    borderRadius: 7,
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: "OpenSans-Regular",
  },
  buttontest: {
    alignSelf: 'center',
    // marginTop: '80%',
    position: 'absolute',
    bottom: 20,
    // marginBottom:0,
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,
    width: '90%',
    // right: 10,
  },
});
