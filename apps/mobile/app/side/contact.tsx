import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import CustomButton from '@/components/ui/atoms/Button';

export default function ContactScreen() {
  const bgColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={[styles.header, { color: textColor }]}>
          Contact Us
        </ThemedText>
        <View style={styles.section}>
          <ThemedText style={[styles.label, { color: textColor }]}>
            Name
          </ThemedText>
          <TextInput
            placeholder="Enter your name"
            placeholderTextColor="#999"
            style={[styles.input, { color: textColor }]}
          />

          <ThemedText style={[styles.label, { color: textColor }]}>
            Email
          </ThemedText>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            style={[styles.input, { color: textColor }]}
          />

          <ThemedText style={[styles.label, { color: textColor }]}>
            Message
          </ThemedText>
          <TextInput
            placeholder="Your message..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            style={[styles.textArea, { color: textColor }]}
          />

          <CustomButton
            title="Send"
            onPress={() => {
              /* TODO: hook up send logic */
            }}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
