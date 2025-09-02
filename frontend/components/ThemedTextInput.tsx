import { StyleSheet, type StyleProp, type TextStyle, type TextInputProps } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native-gesture-handler'

interface ThemedTextInputProps extends TextInputProps {
  // style prop is inherited from TextInputProps, no need to redeclare
}

const ThemedTextInput = ({style, ...props}: ThemedTextInputProps) => {
  return (
    <TextInput style={[{
        
    },
    style]}
    {...props}
    />
  )
}

export default ThemedTextInput

const styles = StyleSheet.create({})