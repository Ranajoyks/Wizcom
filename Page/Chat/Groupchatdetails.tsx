import React, {Component} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Replace with your icon library
import AppIconImage from '../../assets/AppIconImage';
import DropDownPicker from 'react-native-dropdown-picker';
import {Button} from 'native-base';
import BaseComponent from '../../Core/BaseComponent';
import BaseState from '../../Core/BaseState';

export class GroupchatdetailsViewModel {}

export default class Groupchatdetails extends BaseComponent<
  any,
  GroupchatdetailsViewModel
> {
  constructor(props: any) {
    super(props);
    this.state = new BaseState(new GroupchatdetailsViewModel());
  }

  handleSetUrl = () => {
    // Handle setting the URL here, e.g., store it in a state or send it to a server
  };
  render() {
    // const { url } = this.state;
    const prefix = 'https://';
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate("Singlechatpage")
            }}>
            <Image source={require('../../assets/backimg.png')}
          style={
            {height:30,width:30,marginLeft:10}
          }
        />
          </TouchableOpacity>
          <View style={{flex: 1}}>
            {/* <View> */}
            <Text style={styles.title}>Group Chat</Text>
            {/* <Text style={(styles.subtitle, styles.online)}>Online</Text> */}
            {/* </View> */}
            {/* <Text style={(styles.subtitle, styles.offline)}>Offline</Text> */}
          </View>

          <TouchableOpacity
            onPress={() => {
              /* Right icon action */
            }}>
            <Image
              source={require('../../assets/settings.png')}
              style={{height: 30, width: 30, marginRight: 10}}
            />
            <Icon name="bell" size={24} style={styles.icon} />
          </TouchableOpacity>
        </View>

        <View style={styles.groupcontainer}>
      <View>
      <View style={styles.groupheader}>
        <Text style={styles.headerText}>Marketing Team</Text>
      </View>
      <View style={styles.memberCount}>
        <Text style={styles.memberCountText}>7 Members</Text>
      </View>
      </View>
      <View style={styles.avatarContainer}>
        {/* Top Layer */}
        <View style={styles.topLayer}>
          <Image source={{ uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg' }} style={styles.topAvatar} />
        </View>

     
        {/* Bottom Layer */}
        <View style={styles.bottomLayer}>
          <Image source={{ uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg' }} style={styles.avatar} />
          {/* <Image source={{ uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg' }} style={styles.avatar} /> */}
        </View>
        <View style={styles.bottomLayer}>
          <Image source={{ uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg' }} style={styles.avatar2} />
    
        </View>
        <View style={styles.bottomLayer}>
          <Image source={{ uri: 'https://filmfare.wwmindia.com/content/2020/nov/hrithik-roshan-411605007858.jpg' }} style={styles.avatar3} />
    
        </View>
      </View>
    </View>
        <SafeAreaView style={styles.body}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'flex-end',
              flexDirection: 'column',
            }}
            ref="scrollView"
            onContentSizeChange={(width, height) =>
              this.refs.scrollView.scrollTo({y: height})
            }>
            <View>
              <Text style={styles.today}>Today</Text>
            </View>
            <View style={styles.messagefrom}>
              <View style={styles.messagefrommessage}>
                <View style={styles.messagefromicon}>
                  <Text
                    style={{
                      color: '#000',
                      flex: 1,
                      fontSize: 15,
                      textAlign: 'center',
                    }}>
                    BS
                  </Text>
                </View>
                <View style={styles.messagefromtext}>
                  <Text style={styles.messagefromtextcontent}>
                    Hi there, are you available around 4PM today for meeting
                    with a new client?
                  </Text>
                </View>
              </View>
              <View style={styles.messagefromtime}>
                <Text style={styles.messagefromtimetext}>10.45 AM</Text>
              </View>
            </View>

            <View style={styles.messageto}>
              <View style={styles.messagetomessage}>
                <View style={styles.messagetotext}>
                  <Text style={styles.messagetotextcontent}>
                    Hi there, are you available around 4PM today for meeting
                    with a new client?
                  </Text>
                </View>
              </View>
              <View style={styles.messagetotime}>
                <Text style={styles.messagetotimetext}>10.45 AM</Text>
              </View>
            </View>

            <View style={styles.messagefrom}>
              <View style={styles.messagefrommessage}>
                <View style={styles.messagefromicon}>
                  <Text
                    style={{
                      color: '#000',
                      flex: 1,
                      fontSize: 15,
                      textAlign: 'center',
                    }}>
                    BS
                  </Text>
                </View>
                <View style={styles.messagefromtext}>
                  <Text style={styles.messagefromtextcontent}>Hi there!</Text>
                </View>
              </View>
              <View style={styles.messagefromtime}>
                <Text style={styles.messagefromtimetext}>10.45 AM</Text>
              </View>
            </View>

            <View style={styles.messageto}>
              <View style={styles.messagetomessage}>
                <View style={styles.messagetotext}>
                  <Text style={styles.messagetotextcontent}>Hi there!</Text>
                </View>
              </View>
              <View style={styles.messagetotime}>
                <Text style={styles.messagetotimetext}>10.45 AM</Text>
              </View>
            </View>

            <View>
              <Text style={styles.unread}>Unread</Text>
            </View>

            <View style={styles.messagefrom}>
              <View style={styles.messagefrommessage}>
                <View style={styles.messagefromicon}>
                  <Text
                    style={{
                      color: '#000',
                      flex: 1,
                      fontSize: 15,
                      textAlign: 'center',
                    }}>
                    BS
                  </Text>
                </View>
                <View style={styles.messagefromtext}>
                  <Text style={styles.messagefromtextcontent}>Hi there!</Text>
                </View>
              </View>
              <View style={styles.messagefromtime}>
                <Text style={styles.messagefromtimetext}>10.45 AM</Text>
              </View>
            </View>

            <View style={styles.messagefrom}>
              <View style={styles.messagefrommessage}>
                <View style={styles.messagefromicon}>
                  <Text
                    style={{
                      color: '#000',
                      flex: 1,
                      fontSize: 15,
                      textAlign: 'center',
                    }}>
                    BS
                  </Text>
                </View>
                <View style={styles.messagefromtext}>
                  <Text style={styles.messagefromtextcontent}>
                    Hi there, are you available around 4PM today for meeting
                    with a new client?
                  </Text>
                </View>
              </View>
              <View style={styles.messagefromtime}>
                <Text style={styles.messagefromtimetext}>10.45 AM</Text>
              </View>
            </View>
          </ScrollView>
          <View style={{padding: 10}}>
            <View
              style={{
                backgroundColor: '#F1F1F1',
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 6,
                flexDirection: 'row',
              }}>
              <TextInput
                style={
                  (styles.input, {width: Dimensions.get('window').width - 70})
                }
                placeholder="Write your message here"></TextInput>
              <TouchableOpacity
                onPress={() => {
                  /* Left icon action */
                }}
                style={{flexShrink: 1, width: 25, justifyContent: 'center'}}>
                <Image
                  source={require('../../assets/send.png')}
                  style={{height: 25, width: 25}}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
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
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins-bold',
    // color: '#2196f3', // Darker blue title
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Poppins-bold',
    // color: '#2196f3', // Darker blue title
  },
  online: {color: '#0383FA'},
  offline: {color: '#E4B27E'},
  today: {color: '#A6A6A6', textAlign: 'center', fontSize: 16, padding: 20},
  unread: {color: '#0383FA', textAlign: 'center', fontSize: 16, padding: 20},
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  text: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
  },
  scrollView: {},
  text2: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 30,
    letterSpacing: 1.2,
  },
  messagefrom: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexWrap: 'wrap',
  },
  messagefrommessage: {flexDirection: 'row'},
  messagefromicon: {
    backgroundColor: '#E9E9E9',
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 5,
    alignItems: 'center',
    flexDirection: 'row',
  },
  messagefromtext: {paddingLeft: 10, paddingRight: 30},
  messagefromtextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    fontSize: 15,
    color: '#000',
    lineHeight: 25,
  },
  messagefromtime: {
    flexDirections: 'row-reverse',
    paddingRight: 30,
    paddingVertical: 5,
  },
  messagefromtimetext: {flexShrink: 1, textAlign: 'right'},
  messageto: {
    flexDirection: 'column',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messagetomessage: {flexDirection: 'row-reverse'},
  messagetotext: {paddingLeft: 10, paddingRight: 0},
  messagetotextcontent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fef0e1',
    borderRadius: 5,
    fontSize: 15,
    color: '#C66E12',
    lineHeight: 25,
  },
  messagetotime: {
    flexDirections: 'row-reverse',
    paddingRight: 0,
    paddingVertical: 5,
  },
  messagetotimetext: {flexShrink: 1, textAlign: 'right'},
  input: {
    alignSelf: 'center',
    backgroundColor: '#F1F1F1',
    borderColor: '#F1F1F1',
    paddingHorizontal: 5,
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





  groupcontainer: {
  //  padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    flexDirection:'row',

    height:60,
    marginLeft:'5%',
    borderBottomWidth:1,
    borderColor:'#d9eeff'
   // justifyContent:'space-between'
    // Adjust layout properties as needed (e.g., flexDirection, alignItems)
  },

  groupheader: {
   // marginBottom: 15,
  },

  headerText: {
    fontSize: 17,
    fontWeight: '700',
    color:'black',
    // fontWeight: '200',
                      fontFamily: 'Poppins-Regular',
                      // fontSize: 12,
  },

  memberCount: {
    marginBottom: 10,
  },

  memberCountText: {
    fontSize: 14,
    color: '#888',
  },

  avatarContainer: {
    flexDirection:'row',
    //marginRight:100
    width:40,
    marginLeft:'30%'    // Adjust layout properties as needed
  },

  topLayer: {
    position: 'relative',
    top: 0,
    left: 0,
   // zIndex: 3,
  },

  // middleLayer: {
  //   position: 'absolute',
  //  // zIndex: 2,
  // },

  bottomLayer: {
    position: 'relative',
 //   zIndex: 1,
  },

  topAvatar: {
    width: 45,
    height: 45,
    borderRadius: 30,
    right:40
   // top: 10, // Adjust vertical positioning
   // left: 20, // Adjust horizontal positioning
  },

  middleAvatar: {
    width: 45, // Adjust size for overlap
    height: 45,
    borderRadius:30,
    left: 20,
    right:40
   // marginHorizontal: 5, // Adjust spacing
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 20,
    right:60
  //  left: 40,
  },
  avatar2: {
    width: 45,
    height: 45,
    borderRadius: 30,
   // left: 20,
   right:80
  },
  avatar3: {
    width: 45,
    height: 45,
    borderRadius: 30,
   // left: 20,
   right:100
  },
});
