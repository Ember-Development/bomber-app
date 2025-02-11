import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";

interface CardProps {
  type: "info" | "quickAction" | "groupChat" | "trophy";
  title?: string;
  subtitle?: string;
  image?: any;
  icon?: any;
  onPress?: () => void;
  additionalInfo?: string;
}

export default function Card({
  type,
  title,
  subtitle,
  image,
  icon,
  onPress,
  additionalInfo,
}: CardProps) {
  return (
    <Pressable
      style={[styles.card, type === "quickAction" && styles.quickAction]}
      onPress={onPress}
    >
      {image && <Image source={image} style={styles.image} />}
      {icon && <Image source={icon} style={styles.icon} />}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {additionalInfo && (
          <Text style={styles.additionalInfo}>{additionalInfo}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 6,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "semibold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  additionalInfo: {
    fontSize: 12,
    color: "#888",
  },
});
