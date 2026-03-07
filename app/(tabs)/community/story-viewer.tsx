import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { MOCK_STORIES } from '@/constants/communityData';
import { usePersonaImages } from '@/hooks/usePersonaImages';
import type { CommunityStory } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewerScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { colors, state, markStoryViewed } = useApp();
  const { resolve, revision } = usePersonaImages();
  const [currentIndex, setCurrentIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stories = useMemo((): CommunityStory[] => {
    if (userId === 'self') {
      return state.stories.filter(s => s.userId === 'self');
    }
    return MOCK_STORIES.filter(s => s.userId === userId).map(s => ({
      ...s,
      userPhoto: resolve(s.userPhoto) || s.userPhoto,
      imageUri: resolve(s.imageUri) || s.imageUri,
    }));
  }, [userId, state.stories, resolve, revision]);

  const currentStory = stories[currentIndex];

  const startProgress = useCallback(() => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        goNext();
      }
    });
  }, [currentIndex, stories.length]);

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      router.back();
    }
  }, [currentIndex, stories.length, router]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (currentStory) {
      markStoryViewed(currentStory.id);
      startProgress();
    }
    return () => {
      progressAnim.stopAnimation();
    };
  }, [currentIndex, currentStory]);

  const handleTap = useCallback((x: number) => {
    if (x < SCREEN_WIDTH / 3) {
      goPrev();
    } else {
      goNext();
    }
  }, [goPrev, goNext]);

  if (!currentStory || stories.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <X size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum story disponível</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Story Image */}
      <Image source={{ uri: currentStory.imageUri }} style={styles.storyImage} resizeMode="cover" />

      {/* Tap zones */}
      <TouchableOpacity
        style={styles.tapZone}
        activeOpacity={1}
        onPress={(e) => handleTap(e.nativeEvent.locationX)}
      />

      {/* Progress Bars */}
      <View style={styles.progressBar}>
        {stories.map((_, i) => (
          <View key={i} style={[styles.progressTrack, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            {i < currentIndex ? (
              <View style={[styles.progressFill, { width: '100%', backgroundColor: '#FFF' }]} />
            ) : i === currentIndex ? (
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: '#FFF',
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            ) : null}
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.storyHeader}>
        <View style={styles.storyUserInfo}>
          {currentStory.userPhoto ? (
            <Image source={{ uri: currentStory.userPhoto }} style={styles.storyAvatar} />
          ) : (
            <View style={styles.storyAvatarFallback}>
              <Text style={styles.storyAvatarEmoji}>{currentStory.userAvatar}</Text>
            </View>
          )}
          <Text style={styles.storyUserName}>{currentStory.userName}</Text>
          <Text style={styles.storyTime}>
            {Math.floor((Date.now() - new Date(currentStory.date).getTime()) / 3600000)}h
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {currentStory.caption ? (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{currentStory.caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  storyImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, position: 'absolute' },
  tapZone: { ...StyleSheet.absoluteFillObject, zIndex: 1 },

  progressBar: { flexDirection: 'row', gap: 3, paddingHorizontal: 8, paddingTop: 50, zIndex: 10 },
  progressTrack: { flex: 1, height: 2.5, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },

  storyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10, zIndex: 10 },
  storyUserInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storyAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: '#FFF' },
  storyAvatarFallback: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  storyAvatarEmoji: { fontSize: 16 },
  storyUserName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  storyTime: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  closeBtn: { position: 'absolute', top: 50, right: 16, zIndex: 20, padding: 4 },

  captionContainer: { position: 'absolute', bottom: 80, left: 0, right: 0, paddingHorizontal: 20, zIndex: 10 },
  captionText: { color: '#FFF', fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, textAlign: 'center' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#FFF', fontSize: 16 },
});
