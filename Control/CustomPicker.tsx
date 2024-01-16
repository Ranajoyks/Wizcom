import React from 'react';
import {Icon, Item, Label, Picker, View} from 'native-base';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {PickerProps} from 'react-native';
import {ValueType} from './Index';
import Icon2 from 'react-native-vector-icons/AntDesign';

interface CustomPickerProps extends PickerProps {
  Name: string;
  LabelText: string;
  onValueChange?: (value: ValueType) => void;
  selectedValue?: any;
  IsRequired?: boolean;
  Data: any[];
  IsNullable?: boolean;
}

export default function CustomPicker(props: CustomPickerProps) {
  var {
    Name,
    LabelText,
    onValueChange,
    selectedValue,
    IsRequired,
    IsNullable,
    Data,
  } = props;

  if (!selectedValue) {
    selectedValue = '';
  }

  if (!IsNullable) {
    IsNullable = false;
  }

  if (IsNullable) {
    Data.push(<Picker.Item label={LabelText} key="" value="" />);
  }

  React.useEffect(() => {
    setIsEmpty(selectedValue === '');
  });

  const [isEmpty, setIsEmpty] = React.useState(selectedValue === '');
  if (!LabelText) {
    LabelText =
      (IsRequired ? '*' : '') +
      ' Choose ' +
      Name.match(/[A-Z][a-z]+|[0-9]+/g)
        .join(' ')
        .replace(' Id', '');
  }
  const OnChangeInternal = (text: any) => {
    var event = {
      name: Name,
      value: text,
    };
    setIsEmpty(text === '');

    onValueChange && onValueChange(event);
  };

  return (
    <View style={{marginTop: '5%', alignSelf: 'center'}}>
      {/* <Label style={{ marginTop: 5, color: "grey", fontWeight: "bold" ,marginLeft:15,fontSize:15 }}>{LabelText}</Label> */}
      <Item
        style={{
          marginTop: 0,
          marginBottom: 0,
          marginLeft: 0,
          borderRadius: 100,
          borderColor: '#F1F1F1',
       
        }}
        
        error={IsRequired && isEmpty}
        success={IsRequired && !isEmpty}>
        <Picker
          mode="dialog"
          iosIcon={<Icon name="chevron-down" />}
          selectedValue={selectedValue}
          textStyle={{color:"red",fontSize:25}}
          itemTextStyle={{color:"red",fontSize:25}}
          placeholderStyle={{color:"red",fontSize:25}}
          style={{
            backgroundColor: '#F1F1F1', // Match body background
            borderWidth: 1,
            width: '100%',
            borderColor: '#F1F1F1', // Lighter blue border
            borderRadius: 100,
            alignSelf: 'center',
            // fontSize:100
            // padding: 10,
          }}
          onValueChange={itemValue => OnChangeInternal(itemValue)}>
          {Data}
        </Picker>
        {IsRequired && (
          <FontAwesomeIcon
            style={{fontSize: 20, marginEnd: 0}}
            color={isEmpty ? 'red' : 'green'}
            name={isEmpty ? 'close' : 'check'}
          />
        )}
      </Item>
    </View>
  );
}
