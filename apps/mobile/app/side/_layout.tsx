import { Stack } from 'expo-router';

export default function SideLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="history"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="alumnis"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="commitments"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="contact" options={{ headerShown: false }} />
      <Stack.Screen name="videos" options={{ headerShown: false }} />
      <Stack.Screen name="articles" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
    </Stack>
  );
}
