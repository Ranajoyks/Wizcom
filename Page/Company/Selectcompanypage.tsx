import React, { Component } from 'react';

 

import { View, Text, StyleSheet, TouchableOpacity, Image } from
 
'react-native';
import Icon from
 
'react-native-vector-icons/FontAwesome'; // Replace with your icon library
import AppIconImage from '../../assets/AppIconImage';
import DropDownPicker from 'react-native-dropdown-picker'; 
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';
import CustomPicker from '../../Control/CustomPicker';
import { Picker } from 'native-base';

export class CustomerProfileViewModel  {
  CityId: string = '';
  CityList: any[] = [
    { label: 'Company 1', value: '1' },
    { label: 'Company 2', value: '2' },
    // Add more companies
  ];
}


export default class Selectcompanypage extends BaseComponent<
any,
CustomerProfileViewModel
> {
constructor(props: any) {
  super(props);
  this.state = new BaseState(new CustomerProfileViewModel());

}
//  extends Component {
//   constructor(props:any) {
//     super(props);
//     this.state = {
//       selectedCompany: '',
//     };
//   }

  // handleSelectCompany = (company: string) => {
  //   this.setState({ selectedCompany: company });
  // };
  render() {
    var model = this.state.Model;
    // console.log("Hii",model.address)
    // model.AdressLine1=model.address?.description;
    // console.log("Hii",model.AdressLine1)
    // var city=model.address?.terms;
  
    var cityList = model.CityList.map((i, k) => {
      return <Picker.Item label={i.label} key={k} value={i.value} />;
    });
    return (
      <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { /* Left icon action */ }}>
        <Image source={require('../../assets/logo.png')}
  style={
    {height:30,width:30,marginLeft:10}
  }
   />
          {/* <AppIconImage style={
            {height:30,width:30}
          }/> */}
          {/* <Icon name="bars" size={24} style={styles.icon} /> */}
        </TouchableOpacity>
        <Text style={styles.title}>Login</Text>
        <TouchableOpacity onPress={() => { 
       
            this.props.navigation.navigate({
              name: 'settingspage',
            
            });
          /* Right icon action */ }}>
        <Image source={require('../../assets/settings.png')}
  style={
    {height:30,width:30,marginRight:10}
  }
   />
          {/* <Icon name="bell" size={24} style={styles.icon} /> */}
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <Text style={styles.text}>Please select company</Text>
        <Text style={styles.text2}>Select Company</Text>
        <DropDownPicker
  items={[
    { label: 'Company 1', value: '1' },
    { label: 'Company 2', value: '2' },
    // Add more companies
  ]}
  onChangeItem={(item: { value: any; }) => {
    this.setState({ selectedCompany: item.value });
  }}
  placeholder="Select Company"
  selectedValue={this.state.selectedCompany}
  style={styles.dropdown}
/>
{/* <Button style={{ width: '90%', backgroundColor: BaseColor.ColorWhite, alignSelf: 'center', marginTop: '2%', borderRadius: 5, height: 40, }}> */}
                  <CustomPicker
                    Name="CityId"
                    LabelText=""
                    selectedValue={model.CityId}
                    onValueChange={this.SetModelValueX}
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
    fontFamily:'Poppins-Regular'
   // color: '#2196f3', // Darker blue title
  },
  body: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontFamily:'Poppins-Regular',
    alignSelf:'center'
  },
  text2: {
    fontSize: 16,
    fontFamily:'Poppins-Regular',
    alignSelf:'center',
    marginTop:30,
    marginBottom:15,
    letterSpacing:1.2
  },
  dropdown: {
    backgroundColor: '#F1F1F1', // Match body background
    borderWidth: 1,
    borderColor: '#F1F1F1', // Lighter blue border
    borderRadius: 5,
    padding: 10,
  },
});