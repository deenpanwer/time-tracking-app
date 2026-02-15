import React from 'react';
import { Switch as RNSwitch, SwitchProps as RNSwitchProps } from 'react-native';

export function Switch({ ...props }: RNSwitchProps) {
  return (
    <RNSwitch
      trackColor={{ false: "#E9E9EA", true: "#000" }}
      thumbColor="#FFFFFF"
      ios_backgroundColor="#E9E9EA"
      {...props}
    />
  );
}
