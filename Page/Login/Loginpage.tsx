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
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import CustomPicker from '../../Control/CustomPicker';
import {Picker} from 'native-base';
import {Button} from 'native-base';
import SessionHelper from '../../Core/SessionHelper';
import axios from 'axios';

export class LoginViewModel {
  UserName: string = '';
  Password: string = '';
  BranchList: [] = [];
}
export default class Loginpage extends BaseComponent<any, LoginViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new LoginViewModel());
  }
  async componentDidMount(): Promise<void> {
    var value = await SessionHelper.GetSession();
    console.log('value: ', value);
  }
  onChangeText() {}
  handleSetUrl = () => {
    this.props.navigation.navigate({
      name: 'Branchpage',
    });
  };
  Login = async () => {
    var Model = this.state.Model;
    var value = await SessionHelper.GetSession();

    const headers = {
      'Content-Type': 'application/json',
      Cookie: `ASP.NET_SessionId=${value}`,
    };
    console.log('headersList', headers);
    const LoginCredential = {
      objUsr: {
        sName: Model.UserName,
        sCode: Model.Password,
      },
    };
    console.log(LoginCredential);
    axios
      .post(
        `http://eiplutm.eresourceerp.com/AzaaleaR/API/Sys/Sys.aspx/JValidate`,
        LoginCredential,
        {headers: headers},
      )
      .then(response => {
        console.log('response3`', response.data.d.data.ado);
        if (response.data.d.bStatus) {
          // Model.BranchList = response.data.d.data.ado
          this.UpdateViewModel();
          this.props.navigation.navigate('Branchpage', {
            BranchList: response.data.d.data.ado,
          });
        }
      })
      .catch(error => {
        if (error.response) {
          console.log('Response data:', error.response.data);
          console.log('Response status:', error.response.status);
          console.log('Response headers:', error.response.headers);
        } else if (error.request) {
          console.log('No response received:', error.request);
        } else {
          console.log('Error during request setup:', error.message);
        }
      });
  };

  render() {
    var Model = this.state.Model;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {}}>
            <Image
              source={require('../../assets/logo.png')}
              style={{height: 30, width: 30, marginLeft: 10}}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Login</Text>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate({
                name: 'settingspage',
              });
            }}>
            <Image
              source={require('../../assets/settings.png')}
              style={{height: 30, width: 30, marginRight: 10}}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.text}>Please Login</Text>
          <Text style={styles.text2}>USER NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="User Name" // Concatenate prefix with the value
            onChangeText={text => {
              Model.UserName = text;
              this.UpdateViewModel();
            }}
          />
          <Text style={styles.text3}>PASSWORD</Text>
          <TextInput
            style={styles.input}
            placeholder="Password" // Concatenate prefix with the value
            onChangeText={text => {
              Model.Password = text;
              this.UpdateViewModel;
            }}
          />
          <Button onPress={this.Login} style={styles.buttontest}>
            <Text
              style={{
                color: 'white',
                fontWeight: '800',
                fontFamily: 'Poppins-Regular',
              }}>
              Login
            </Text>
          </Button>
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
    marginBottom: 5,
    letterSpacing: 1.2,
  },
  text3: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 5,
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
  },
  buttontest: {
    alignSelf: 'center',
    marginTop: '80%',
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,
    width: '95%',
  },
});
