import React, {Component} from 'react';

import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Replace with your icon library
import AppIconImage from '../../assets/AppIconImage';
import DropDownPicker from 'react-native-dropdown-picker';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import CustomPicker from '../../Control/CustomPicker';
import {Picker} from 'native-base';
export class BranchViewModel {
  BranchId: string = '';
  BranchList: any[] = [];
}
export default class Branchpage extends BaseComponent<any, BranchViewModel> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new BranchViewModel());
    this.state.Model.BranchList = props.route.params.BranchList;
    // console.log("Props: ",props.route.params.BranchList);
    
  }



  SetCompany = (event: any) => {
    this.SetModelValue(event.name, event.value);
    this.props.navigation.navigate({
      name: 'Singlechatpage',
    });
    // this.UpdateViewModel()
  };
  render() {
    var model = this.state.Model;
    var branchList = model.BranchList.map((i, k) => {
      return <Picker.Item label={i?.sName} key={k} value={i.lId} />;
    });
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
          <Text style={styles.title}>Branch</Text>
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
          <Text style={styles.text}>Please select your branch</Text>
          {/* <Text style={styles.text2}>Select Company</Text> */}
          <CustomPicker
            Name="CityId"
            LabelText="Select Branch"
            selectedValue={model.BranchId}
            onValueChange={this.SetCompany}
            Data={branchList}
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
    marginBottom:20
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
    marginTop: '90%',
    height: 50,
    textAlign: 'center',
    justifyContent: 'center',
    backgroundColor: '#0383FA',
    color: 'white',
    borderRadius: 7,

    // padding: 10,
    width: '95%',
  },
});
