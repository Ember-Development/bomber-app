import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Pressable, Animated } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";

interface Event {
  date: string;
  title: string;
  location: string;
  time: string;
}

const eventData: Event = {
  date: "2025-05-12T19:00:00",
  title: "Texas Bombers 16U - Hitting Practice",
  location: "Bomber Lab Facility",
  time: "7:00 PM - 8:30 PM",
};

export default function EventCardContainer() {
  const [selectedTab, setSelectedTab] = useState<"Upcoming" | "Past">(
    "Upcoming"
  );
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const eventTime = new Date(eventData.date).getTime();
      const timeDifference = eventTime - now;

      if (timeDifference <= 0) {
        setCountdown("Event Started");
        return;
      }

      const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor(
        (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleTab = (tab: "Upcoming" | "Past") => {
    setSelectedTab(tab);
    Animated.timing(animatedValue, {
      toValue: tab === "Upcoming" ? 0 : 1,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const slideStyle = {
    left: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0%", "50%"],
    }),
  };

  return (
    <View style={styles.eventCard}>
      <View style={styles.toggleContainer}>
        <Animated.View style={[styles.activeIndicator, slideStyle]} />
        <Pressable style={styles.tab} onPress={() => toggleTab("Upcoming")}>
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "Upcoming" && styles.activeText,
            ]}
          >
            Upcoming
          </ThemedText>
        </Pressable>
        <Pressable style={styles.tab} onPress={() => toggleTab("Past")}>
          <ThemedText
            style={[
              styles.tabText,
              selectedTab === "Past" && styles.activeText,
            ]}
          >
            Past
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.dateContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="ticket-outline" size={20} color="#000" />
          <ThemedText type="subtitle" style={styles.titleText}>
            {eventData.date.split("T")[0]}
          </ThemedText>
        </View>
        <ThemedText style={styles.countdownText}>{countdown}</ThemedText>
      </View>

      <View style={styles.detailContainer}>
        <ThemedText type="title" style={styles.eventTitle}>
          {eventData.title}
        </ThemedText>
        <ThemedText style={styles.eventText}>{eventData.location}</ThemedText>
        <ThemedText style={styles.eventText}>{eventData.time}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#EAEAEA",
    borderRadius: 12,
    position: "relative",
    overflow: "hidden",
    height: 40,
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#5AA5FF",
  },
  activeIndicator: {
    position: "absolute",
    width: "50%",
    height: "100%",
    backgroundColor: "#000",
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    fontSize: 12,
    color: "#6D6D6D",
    fontWeight: "500",
  },
  titleText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "bold",
    marginLeft: 8,
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dateText: {
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 12,
  },
  detailContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#000",
    borderRadius: 8,
  },
  eventTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventText: {
    color: "#fff",
    fontSize: 14,
  },
  iconContainer: {
    display: "flex",
    flexDirection: "row",
  },
});
