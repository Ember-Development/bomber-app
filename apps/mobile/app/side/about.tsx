import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
  StatusBar,
  FlatList,
  Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import BackgroundWrapper from '@/components/ui/organisms/backgroundWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { GlobalColors } from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HORIZONTAL_PADDING = 20;
const CARD_WIDTH = SCREEN_WIDTH - CARD_HORIZONTAL_PADDING * 2;

const TEAM_MEMBERS = [
  {
    id: 'scott',
    name: 'Scott Smith',
    role: 'CEO / President / Head Coach - 18U Gold',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Scott-Smith-scaled-landscape-e56529274e6452b73edfc3d53bbaea3e-5f90a34246c8e.jpg',
    bio: 'Scott oversees the entire program. As our head coach, he has guided multiple teams to national championships. When he’s not on the field, Scott enjoys spending time with his family and analyzing advanced softball analytics.',
  },
  {
    id: 'bo',
    name: 'Bo Vinton',
    role: 'Chief Operating Officer/Executive Vice President',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Bo-Vinton-scaled-landscape-3aa2faa3a59fec1219804926fbd3a33f-5f90a34246c8e.jpg',
    bio: 'Bo heads up our player development curriculum and mentors each coach on the staff. He has a proven track record of developing hitters into Division‐I recruits. In his free time, Bo loves fishing and tinkering with baseball swing data.',
  },
  {
    id: 'david',
    name: 'David McCorkle',
    role: 'Assistant Program Director/Vice President',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/David-McCorkle-scaled-landscape-5c5db9ae467f5c088d903022b57fd88f-5f90a34246c8e.jpg',
    bio: 'David leads the 16U Platinum squad and specializes in defensive strategy. He has coached multiple college-bound pitchers. Outside softball, David is a high school math teacher and volunteers at local youth camps.',
  },
  {
    id: 'jane',
    name: 'Jennifer Vinton',
    role: 'Director of Operations',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Jennifer-Vinton-scaled-landscape-078f9bfeb75e201aab6137dde8943af5-5f90a34246c8e.jpg',
    bio: 'Jane focuses on infield development and works closely with our middle‐school camps. She holds multiple coaching clinics across the state. In her spare time, she loves reading and hiking with her dog, Daisy.',
  },
  {
    id: 'john',
    name: 'Frank Lopez',
    role: 'Youth Director',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Frank-Lopez-1-scaled-landscape-e3f7819616404e5c90ab23650caf4a90-5f90a34246c8e.jpg',
    bio: 'John is our lead pitching instructor—he’s sent over 50 pitchers to NCAA programs. A former all‐state pitcher himself, he now devotes his time to biomechanics research. Off the mound, John enjoys woodworking.',
  },
  {
    id: 'emily',
    name: 'Jade Nottebrok',
    role: 'Media Director',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/bb-plugin/cache/Jade-Nottebrok-scaled-landscape-6d6f7a877b9ffb01e55b7fb63dd7d2d9-5f90a34246c8e.jpg',
    bio: 'Emily oversees all strength and conditioning regimens. With a background in sports nutrition, she keeps our athletes performing at peak levels. When not at the gym, Emily bakes sourdough and trains for marathons.',
  },
];

const FACILITIES = [
  {
    id: 'facility1',
    name: 'Main Training Complex',
    description:
      'State-of-the-art turf fields, batting cages, and weight rooms, all under one roof.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/Facility_MainComplex.jpg',
  },
  {
    id: 'facility3',
    name: 'Pitching Lab',
    description:
      'High-speed cameras and biomechanical analysis tools to perfect pitching mechanics.',
    imageUri:
      'https://bombersfastpitch.net/wp-content/uploads/2022/03/Facility_PitchingLab.jpg',
  },
];

const CULTURE_METRICS = [
  {
    id: 'metric1',
    number: '25+',
    label: 'Teams Nationally Ranked',
  },
  {
    id: 'metric2',
    number: '1000+',
    label: 'College Commitments',
  },
  {
    id: 'metric3',
    number: '162',
    label: 'Teams in 28 States',
  },
  {
    id: 'metric4',
    number: '400+',
    label: 'Bomber Coaches',
  },
  {
    id: 'metric5',
    number: '1900+',
    label: 'Bombers Nationwide',
  },
  {
    id: 'metric6',
    number: '25',
    label: 'Years of Excellence',
  },
];

const METRIC_CARD_WIDTH = CARD_WIDTH * 0.6;
const METRIC_CARD_SPACING = 16;
const SINGLE_SET_WIDTH =
  CULTURE_METRICS.length * (METRIC_CARD_WIDTH + METRIC_CARD_SPACING);

const SCROLL_DURATION = 35000;

export default function AboutScreen() {
  const textColor = useThemeColor({}, 'text');
  const roleBadgeColor = useThemeColor({}, 'component');

  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: -SINGLE_SET_WIDTH,
          duration: SCROLL_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [translateX]);

  return (
    <BackgroundWrapper>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <SafeAreaView style={[styles.container]}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introContainer}>
            <ThemedText style={[styles.introTitle, { color: textColor }]}>
              WE ARE BOMBERS FASTPITCH
            </ThemedText>
            <ThemedText style={[styles.introParagraph, { color: textColor }]}>
              Bombers Fastpitch is a premier junior Olympic girls softball
              program. Our primary goal is to develop young women into highly
              skilled athletes who can compete for and earn college
              scholarships. We believe in focusing on competition at the highest
              level as well as utilizing data and analytics to further the
              development of our players.
            </ThemedText>
          </View>

          <View style={styles.cultureTitleContainer}>
            <ThemedText style={[styles.cultureTitle, { color: textColor }]}>
              Culture
            </ThemedText>
          </View>

          <View style={styles.carouselViewport}>
            <Animated.View
              style={{
                flexDirection: 'row',
                transform: [{ translateX }],
              }}
            >
              {[...CULTURE_METRICS, ...CULTURE_METRICS].map((item, idx) => (
                <View
                  key={`${item.id}-${idx}`}
                  style={styles.metricCardWrapper}
                >
                  <BlurView
                    intensity={30}
                    tint="light"
                    style={styles.metricCardGlass}
                  >
                    <View style={styles.metricCardContent}>
                      <ThemedText style={styles.metricNumber}>
                        {item.number}
                      </ThemedText>
                      <ThemedText
                        style={[styles.metricLabel, { color: textColor }]}
                      >
                        {item.label}
                      </ThemedText>
                    </View>
                  </BlurView>
                </View>
              ))}
            </Animated.View>
          </View>

          {/* HEADER */}
          <View style={styles.headerContainer}>
            <ThemedText style={[styles.headerTitle, { color: textColor }]}>
              Admin Staff
            </ThemedText>
          </View>

          {/* TEAM LIST */}
          {TEAM_MEMBERS.map((member) => (
            <TouchableOpacity
              key={member.id}
              activeOpacity={0.8}
              style={styles.cardOuterWrapper}
              onPress={() => {
                console.log('Tapped', member.name);
              }}
            >
              <View style={styles.cardContent}>
                <View style={styles.photoWrapper}>
                  <Image
                    source={{ uri: member.imageUri }}
                    style={styles.photo}
                  />
                </View>

                <View
                  style={[styles.roleBadge, { borderColor: roleBadgeColor }]}
                >
                  <ThemedText
                    style={[styles.roleBadgeText, { color: roleBadgeColor }]}
                  >
                    {member.role.toUpperCase()}
                  </ThemedText>
                </View>

                <ThemedText style={[styles.nameText, { color: textColor }]}>
                  {member.name}
                </ThemedText>

                <ThemedText style={[styles.bioText, { color: textColor }]}>
                  {member.bio}
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.headerContainer}>
            <ThemedText style={[styles.headerTitle, { color: textColor }]}>
              Facilities
            </ThemedText>
          </View>

          {FACILITIES.map((facility) => (
            <TouchableOpacity
              key={facility.id}
              activeOpacity={0.8}
              style={styles.cardOuterWrapper}
              onPress={() => {
                console.log('Tapped Facility:', facility.name);
              }}
            >
              <BlurView intensity={30} tint="light" style={styles.cardGlass}>
                <View style={styles.cardContent}>
                  <View style={styles.photoWrapper}>
                    {facility.imageUri ? (
                      <Image
                        source={{ uri: facility.imageUri }}
                        style={styles.photo}
                      />
                    ) : (
                      <Ionicons
                        name="location-outline"
                        size={48}
                        color={textColor}
                      />
                    )}
                  </View>

                  <ThemedText style={[styles.nameText, { color: textColor }]}>
                    {facility.name}
                  </ThemedText>

                  <ThemedText style={[styles.bioText, { color: textColor }]}>
                    {facility.description}
                  </ThemedText>
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* FLOATING BACK BUTTON */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={GlobalColors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  scrollContainer: {
    paddingTop: 50,
    paddingBottom: 40,
  },

  introContainer: {
    marginHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 36,
    textAlign: 'center',
  },
  introParagraph: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },

  cultureTitleContainer: {
    marginHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 12,
  },
  cultureTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    textAlign: 'left',
  },

  carouselViewport: {
    width: CARD_WIDTH,
    height: 120,
    marginBottom: 32,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  carouselWrapper: {
    height: 120,
    marginBottom: 32,
  },
  metricCardWrapper: {
    width: CARD_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricCardGlass: {
    width: CARD_WIDTH - 40,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginHorizontal: 20,
  },

  metricCardContent: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  metricNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    color: GlobalColors.bomber,
  },
  metricLabel: { fontSize: 14, textAlign: 'center' },

  headerContainer: {
    marginHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },

  cardOuterWrapper: {
    marginHorizontal: CARD_HORIZONTAL_PADDING,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGlass: {
    width: CARD_WIDTH,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
    alignItems: 'center',
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    opacity: 0.9,
  },

  backButton: {
    position: 'absolute',
    top: 86,
    left: 16,
    zIndex: 10,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
