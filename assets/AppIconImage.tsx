import React, { Component } from 'react'
import { View, Image, StyleSheet } from 'react-native'

const AppIconImage = (props:any) => (
   <Image source={require('../assets/logo.png')}
   style={props.style ?? styles.DefaultStyle}
   />
)

const styles = StyleSheet.create({
   DefaultStyle: {
      height:120,
      width:120
     
       }
})
export default AppIconImage