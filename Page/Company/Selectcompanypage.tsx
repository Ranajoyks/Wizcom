import React, {Component} from 'react';

import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Replace with your icon library
import AppIconImage from '../../assets/AppIconImage';
import DropDownPicker from 'react-native-dropdown-picker';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import CustomPicker from '../../Control/CustomPicker';
import {Picker} from 'native-base';
import axios from 'axios';
import SessionHelper from '../../Core/SessionHelper';

export class CompanyViewModel {
  CityId: string = '';
  CityList: any[] = [];
}

export default class Selectcompanypage extends BaseComponent<
  any,
  CompanyViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new CompanyViewModel());
  }
  SetCompany = (event: any) => {
    this.SetModelValue(event.name, event.value);
    this.props.navigation.navigate({
      name: 'Loginpage',
    });
  };
  headers = {
    'Content-Type': 'application/json',
  };
  componentDidMount(): void {
    this.Initializes();
  }

  Initializes = () => {
    axios
      .post(
        `http://eiplutm.eresourceerp.com/AzaaleaR/API/Sys/Sys.aspx/JInitialize`,
        {headers: this.headers},
      )
      .then(res => {
        console.log('Response: ', res.data.d.data.ado);
        var CompanyArray = res.data.d.data.ado;
        if (res.data.d.bStatus) {
          var model = this.state.Model;
          model.CityList = res.data.d.data.ado;
          this.UpdateViewModel();
          // const SessionID = localStorage.setItem(
          //   "SessionID",
          //   res.data.d.cError
          // );
          // navigate("/login");
        }
        console.log(CompanyArray.length);
        if (CompanyArray.length === 1) {
          // setLoading(false);
          const postData = {
            sCode: CompanyArray[0].CODE,
            dtOffSet: 330,
            cPlatForm: 'M',
          };
          axios
            .post(
              `http://eiplutm.eresourceerp.com/AzaaleaR/API/Sys/Sys.aspx/JConnect`,
              postData,
              {
                headers: this.headers,
              },
            )
            .then(res => {
              console.log(res.data.d.bStatus);
              console.log('postData: ', postData);
              if (res.data.d.bStatus) {
                this.props.navigation.navigate({
                  name: 'Loginpage',
                });
                console.log(res.data.d.cError);
                SessionHelper.SetSession(res.data.d.cError);
              }
            })
            .catch(err => {
              // console.log(err);
            });
        }
        // if (res.data.d.bStatus) {
        //   setCompany(res.data.d.data.ado);
        //   setLoading(false);
        // }
      })
      .catch(err => {
        console.log('Err: ', err);
      });
  };
  render() {
    var model = this.state.Model;
    var cityList: any[] = [];
    console.log('test', model.CityList);
    if (model.CityList) {
      cityList = model.CityList?.map((i, k) => {
        return <Picker.Item label={i?.NAME} key={k} value={i?.CODE} />;
      });
    }
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
          <Text style={styles.title}>Login</Text>
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
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.text}>Please select company</Text>
          <Text style={styles.text2}>Select Company</Text>
          <CustomPicker
            Name="CityId"
            LabelText="Select Company"
            selectedValue={model.CityId}
            onValueChange={this.SetCompany}
            Data={cityList}
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
    marginBottom: 15,
    letterSpacing: 1.2,
  },
  dropdown: {
    backgroundColor: '#F1F1F1', // Match body background
    borderWidth: 1,
    borderColor: '#F1F1F1', // Lighter blue border
    borderRadius: 5,
    padding: 10,
  },
});
