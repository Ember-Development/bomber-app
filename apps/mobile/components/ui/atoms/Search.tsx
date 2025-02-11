import React, { useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SearchFieldProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export default function SearchField({
  placeholder = "Search...",
  onSearch,
}: SearchFieldProps) {
  const [query, setQuery] = useState("");

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#888" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          if (onSearch) onSearch(text);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#000",
    marginLeft: 5,
  },
});
