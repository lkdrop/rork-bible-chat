import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { Play, Pause, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { usePrayerGuide } from '@/contexts/PrayerGuideContext';

const DURATIONS = [
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
];

export default function TimerScreen() {
  const { addMeditationTime } = usePrayerGuide();
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(DURATIONS[0].seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const breatheAnim = useRef(new Animated.Value(0.6)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breatheAnimRef = useRef<Animated.CompositeAnimation | null>(null);

  const startBreatheAnimation = useCallback(() => {
    breatheAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 0.6,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breatheAnimRef.current.start();
  }, [breatheAnim, glowAnim]);

  const stopBreatheAnimation = useCallback(() => {
    if (breatheAnimRef.current) {
      breatheAnimRef.current.stop();
      breatheAnimRef.current = null;
    }
  }, []);

  const handleStart = useCallback(() => {
    setIsRunning(true);
    setIsFinished(false);
    startBreatheAnimation();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [startBreatheAnimation]);

  const handlePause = useCallback(() => {
    setIsRunning(false);
    stopBreatheAnimation();
  }, [stopBreatheAnimation]);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingSeconds(DURATIONS[selectedDuration].seconds);
    stopBreatheAnimation();
    breatheAnim.setValue(0.6);
    glowAnim.setValue(0.3);
  }, [selectedDuration, stopBreatheAnimation, breatheAnim, glowAnim]);

  const handleDurationSelect = useCallback((index: number) => {
    if (isRunning) return;
    setSelectedDuration(index);
    setRemainingSeconds(DURATIONS[index].seconds);
    setIsFinished(false);
    void Haptics.selectionAsync();
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            stopBreatheAnimation();
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const minutes = Math.round(DURATIONS[selectedDuration].seconds / 60);
            void addMeditationTime(minutes);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds, selectedDuration, stopBreatheAnimation, addMeditationTime]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercentage = 1 - (remainingSeconds / DURATIONS[selectedDuration].seconds);

  return (
    <>
      <Stack.Screen options={{ title: 'Meditação', headerShown: true }} />
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={styles.content}>
          <View style={styles.durationSelector}>
            {DURATIONS.map((dur, idx) => (
              <TouchableOpacity
                key={dur.label}
                style={[styles.durationButton, selectedDuration === idx && styles.durationButtonActive]}
                onPress={() => handleDurationSelect(idx)}
                activeOpacity={0.7}
              >
                <Text style={[styles.durationText, selectedDuration === idx && styles.durationTextActive]}>
                  {dur.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.timerContainer}>
            <Animated.View
              style={[
                styles.outerCircle,
                { opacity: glowAnim, transform: [{ scale: breatheAnim }] },
              ]}
            />
            <View style={styles.timerCircle}>
              <View style={[
                styles.progressRing,
                { opacity: progressPercentage > 0 ? 1 : 0.3 },
              ]} />
              <Text style={styles.timerText}>{formatTime(remainingSeconds)}</Text>
              <Text style={styles.breatheLabel}>
                {isFinished ? 'Concluído!' : isRunning ? 'Respire...' : 'Pronto para meditar'}
              </Text>
            </View>
          </View>

          <View style={styles.controls}>
            {isFinished ? (
              <TouchableOpacity style={styles.controlButton} onPress={handleReset} activeOpacity={0.8}>
                <RotateCcw size={28} color={Colors.text.light} />
              </TouchableOpacity>
            ) : isRunning ? (
              <View style={styles.controlRow}>
                <TouchableOpacity style={styles.controlButtonSmall} onPress={handleReset} activeOpacity={0.8}>
                  <RotateCcw size={22} color={Colors.primary.navy} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, styles.pauseButton]} onPress={handlePause} activeOpacity={0.8}>
                  <Pause size={28} color={Colors.text.light} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.controlButton} onPress={handleStart} activeOpacity={0.8}>
                <Play size={28} color={Colors.text.light} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.tipText}>
            {isRunning
              ? 'Inspire quando o círculo expandir, expire quando contrair'
              : 'Encontre um lugar tranquilo, feche os olhos e conecte-se com Deus'}
          </Text>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.navy,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  durationSelector: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 4,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  durationButtonActive: {
    backgroundColor: Colors.accent.gold,
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255,255,255,0.6)',
  },
  durationTextActive: {
    color: Colors.text.light,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    height: 260,
  },
  outerCircle: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.accent.gold,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.accent.gold,
  },
  progressRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: Colors.accent.gold,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '200' as const,
    color: Colors.text.light,
    letterSpacing: 4,
  },
  breatheLabel: {
    fontSize: 14,
    color: Colors.accent.goldLight,
    marginTop: 8,
  },
  controls: {
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent.gold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  pauseButton: {
    backgroundColor: '#e67e22',
  },
  controlButtonSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: Colors.accent.goldLight,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});
