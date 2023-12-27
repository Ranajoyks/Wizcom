import React, { Component } from 'react';
import { Text, View } from 'react-native';
import AppStack from './Root/AppStack';
import { Root } from "native-base";




export default class App extends Component {
  render() {
    return (
    // <View>
    //   <Text>Hello</Text>
    // </View>
      <Root>
        <AppStack />
        </Root>
    
    
    );
  }
}
