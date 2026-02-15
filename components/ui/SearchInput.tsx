import React from 'react';
import { Search } from 'lucide-react-native';
import { Input } from './Input';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChangeText, placeholder = "Search..." }: SearchInputProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      leftIcon={<Search size={20} color="#A0A0A0" />}
      className="bg-secondary/50 rounded-full h-12"
      containerClassName="mb-0"
    />
  );
}
