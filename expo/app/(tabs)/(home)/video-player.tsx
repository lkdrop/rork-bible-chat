import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { X, Play, Pause, RotateCcw, Share2, Volume2, VolumeX } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { BIBLE_VIDEOS } from '@/constants/bibleVideos';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const router = useRouter();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const { colors } = useApp();
  const videoRef = useRef<Video>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const video = BIBLE_VIDEOS.find(v => v.id === videoId);

  const hideControlsLater = useCallback(() => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    if (showControls && isPlaying) hideControlsLater();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, [showControls, isPlaying, hideControlsLater]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error('[VideoPlayer] Error:', status.error);
        setHasError(true);
      }
      return;
    }
    setIsLoading(false);
    setIsPlaying(status.isPlaying);
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
  }, []);

  const togglePlay = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!videoRef.current) return;
    const status = await videoRef.current.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      if (status.didJustFinish) {
        await videoRef.current.replayAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  }, []);

  const toggleMute = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!videoRef.current) return;
    setIsMuted(m => !m);
    await videoRef.current.setIsMutedAsync(!isMuted);
  }, [isMuted]);

  const replay = useCallback(async () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!videoRef.current) return;
    setHasError(false);
    setIsLoading(true);
    await videoRef.current.replayAsync();
  }, []);

  const handleTap = useCallback(() => {
    setShowControls(prev => !prev);
  }, []);

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  if (!video) {
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
          <X size={28} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>Vídeo não encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <Video
        ref={videoRef}
        source={{ uri: video.url }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isMuted={isMuted}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        onError={(e) => {
          console.error('[VideoPlayer] Load error:', e);
          setHasError(true);
          setIsLoading(false);
        }}
      />

      {/* Tap zone */}
      <TouchableOpacity
        style={styles.tapZone}
        activeOpacity={1}
        onPress={handleTap}
      />

      {/* Loading */}
      {isLoading && !hasError && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#D4A84B" />
          <Text style={styles.loadingText}>Carregando vídeo...</Text>
        </View>
      )}

      {/* Error */}
      {hasError && (
        <View style={styles.centerContent}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>Erro ao carregar vídeo</Text>
          <Text style={styles.errorSub}>Verifique sua conexão e tente novamente</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={replay}>
            <RotateCcw size={18} color="#FFF" />
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls overlay */}
      {showControls && (
        <>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.topBtn} onPress={() => router.back()}>
              <X size={26} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.topTitle}>
              <Text style={styles.topTitleText} numberOfLines={1}>{video.title}</Text>
            </View>
            <TouchableOpacity style={styles.topBtn} onPress={toggleMute}>
              {isMuted ? <VolumeX size={22} color="#FFF" /> : <Volume2 size={22} color="#FFF" />}
            </TouchableOpacity>
          </View>

          {/* Center play/pause */}
          {!isLoading && !hasError && (
            <View style={styles.centerControls}>
              <TouchableOpacity style={styles.playPauseBtn} onPress={togglePlay}>
                {isPlaying ? (
                  <Pause size={36} color="#FFF" fill="#FFF" />
                ) : (
                  <Play size={36} color="#FFF" fill="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Bottom bar with progress */}
          <View style={styles.bottomBar}>
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoEmoji}>{video.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.videoTitle} numberOfLines={1}>{video.title}</Text>
                <Text style={styles.videoDesc} numberOfLines={1}>{video.description}</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  video: { flex: 1 },
  tapZone: { ...StyleSheet.absoluteFillObject, zIndex: 1 },

  centerContent: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  loadingText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 12 },
  errorEmoji: { fontSize: 48, marginBottom: 12 },
  errorText: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  errorSub: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(139,92,246,0.3)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  retryText: { color: '#FFF', fontSize: 14, fontWeight: '600' },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 40, paddingHorizontal: 12, paddingBottom: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.4)' },
  topBtn: { padding: 8 },
  topTitle: { flex: 1, alignItems: 'center' },
  topTitleText: { color: '#FFF', fontSize: 15, fontWeight: '700' },

  centerControls: { position: 'absolute', top: '50%', left: '50%', marginTop: -32, marginLeft: -32, zIndex: 5 },
  playPauseBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: Platform.OS === 'ios' ? 40 : 24, paddingTop: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)' },
  progressContainer: { marginBottom: 8 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#D4A84B', borderRadius: 2 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  timeText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500' },
  videoInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  videoEmoji: { fontSize: 24 },
  videoTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  videoDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});
