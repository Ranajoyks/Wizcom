import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Replace with your icon library
import AppIconImage from '../../assets/AppIconImage';
import DropDownPicker from 'react-native-dropdown-picker';
import {Button} from 'native-base';

export default class Settingspage extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      url: '',
    };
  }

  handleSetUrl = () => {
    // Handle setting the URL here, e.g., store it in a state or send it to a server
  };
  render() {
    const {url} = this.state;
    const prefix = 'https://';
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
              style={{height: 30, width: 30, marginRight: 10}}
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
            value={url.startsWith(prefix) ? url : prefix + url} // Concatenate prefix with the value
            onChangeText={text => {
              if (!text.startsWith(prefix)) {
                // If the input does not start with the prefix, set the state directly
                this.setState({url: text});
              } else if (text.startsWith(prefix) && !url.startsWith(prefix)) {
                // If backspacing and removing the prefix, update the state without the prefix
                this.setState({url: text.substring(prefix.length)});
              } else {
                // In other cases, set the state directly
                this.setState({url: text});
              }
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
    marginBottom: 10,
    borderRadius: 7,
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
