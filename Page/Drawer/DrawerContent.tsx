import React from 'react';
import {StyleSheet} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import Icon5 from 'react-native-vector-icons/FontAwesome';
import BaseColor from '../../Core/BaseTheme';

export default function DrawerContent(props:any) {

  var pressCount = 0;
  //console.log('pressCount:' + pressCount);

  
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
    
     
      <DrawerItem
        label="Home"
        labelStyle={style.label}
        icon={() => <Icon5 name="play-circle-o" style={style.Icon} />}
        onPress={() => {
          props.navigation.navigate('AppShowCase');
        }}
      />
     
    </DrawerContentScrollView>
  );
}

const style = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    color: BaseColor.ColorPink,    
  },
  Icon: {
    marginTop: 5,
    fontSize: 22,
    color: BaseColor.ColorPink,
    alignSelf: 'flex-start',
    width: 22,
  },
  SeparatorText: {
    fontSize: 12,
    fontWeight:"bold"
  },
});           
