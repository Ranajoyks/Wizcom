import React, {Component} from 'react';
import {
  View,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  Text,
} from 'react-native';
import AppIconImage from '../../assets/AppIconImage';

import BaseColor from '../../Core/BaseTheme';
import LinearGradient from 'react-native-linear-gradient';
import {CommonActions} from '@react-navigation/native';

import {Container, Spinner} from 'native-base';
import axios from 'axios';

export default class Splash extends Component<any, any> {
  constructor(props: any) {
    super(props);
    setTimeout(() => {
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'Loginpage' }],
    });
    }, 2000);
  }
  

  render() {
    return (
      <LinearGradient
        colors={['#011024', '#002252', '#0248A8']}
        style={styles.gradientContainer}>
        <View>
          <StatusBar
            barStyle="dark-content"
            hidden={true}
            backgroundColor={BaseColor.ColorWhite}
            translucent={true}
          />
          {/* <ImageBackground source={require('./assets/g.jpg')} style={styles.image}> */}
          <View
            style={{
              alignSelf: 'center',
              marginTop: 20,
              justifyContent: 'center',
            }}>
            <AppIconImage />
            <Text style={styles.text}>EResource</Text>
            <Text style={styles.bottomtext}>Messenger</Text>

            {/* <View style={{marginTop:'5%'}}>
                    <ActivityIndicator animating={true} size="large" color={BaseColor.ColorGreen} />
                    </View> */}
          </View>
          {/* </ImageBackground> */}
        </View>
      </LinearGradient>
    );
  }
}
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 24,
    // fontWeight: "bold",
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    // backgroundColor: "#000000a0"
  },
  bottomtext: {
    color: 'white',
    fontSize: 19,
    // fontWeight: "bold",
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
    // backgroundColor: "#000000a0"
  },
});
