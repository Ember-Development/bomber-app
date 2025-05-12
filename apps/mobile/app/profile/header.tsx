import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileHeader() {
  return (
    <LinearGradient colors={['#111111', '#222222']} style={styles.header}>
      <Text style={styles.name}>Gunnar Smith</Text>
      <Text style={styles.email}>gunnarsmith30@gmail.com</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => console.log('Edit pressed')}
      >
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#000',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
  },
  editButtonText: {
    color: '#000',
    fontWeight: '500',
    fontSize: 14,
  },
});
