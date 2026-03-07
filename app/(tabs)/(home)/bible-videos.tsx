import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { ArrowLeft, Play, Clock, Filter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { BIBLE_VIDEOS, videoCategoryLabels, videoCategoryEmojis } from '@/constants/bibleVideos';
import type { BibleVideo } from '@/constants/bibleVideos';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function BibleVideosScreen() {
  const router = useRouter();
  const { colors } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(BIBLE_VIDEOS.map(v => v.category))];

  const filteredVideos = selectedCategory
    ? BIBLE_VIDEOS.filter(v => v.category === selectedCategory)
    : BIBLE_VIDEOS;

  const openVideo = useCallback((video: BibleVideo) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/(tabs)/(home)/video-player', params: { videoId: video.id } });
  }, [router]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Videos Biblicos</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introEmoji}>🎬</Text>
          <Text style={[styles.introTitle, { color: colors.text }]}>Historias da Biblia</Text>
          <Text style={[styles.introSub, { color: colors.textSecondary }]}>
            Assista videos inspiradores sobre as grandes historias da Biblia
          </Text>
        </View>

        {/* Category Filter */}
        {categories.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                {
                  backgroundColor: !selectedCategory ? 'rgba(139,92,246,0.2)' : colors.card,
                  borderColor: !selectedCategory ? '#C5943A' : colors.borderLight,
                },
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Text style={[styles.filterText, { color: !selectedCategory ? '#D4A84B' : colors.text }]}>
                Todos
              </Text>
            </TouchableOpacity>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedCategory === cat ? 'rgba(139,92,246,0.2)' : colors.card,
                    borderColor: selectedCategory === cat ? '#C5943A' : colors.borderLight,
                  },
                ]}
                onPress={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
              >
                <Text style={styles.filterEmoji}>{videoCategoryEmojis[cat]}</Text>
                <Text style={[styles.filterText, { color: selectedCategory === cat ? '#D4A84B' : colors.text }]}>
                  {videoCategoryLabels[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Video List */}
        <View style={styles.videoList}>
          {filteredVideos.map(video => (
            <TouchableOpacity
              key={video.id}
              style={[styles.videoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => openVideo(video)}
              activeOpacity={0.8}
            >
              <View style={styles.thumbnailContainer}>
                <View style={[styles.thumbnailPlaceholder, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                  <Text style={styles.thumbnailEmoji}>{video.emoji}</Text>
                </View>
                <View style={styles.playOverlay}>
                  <View style={styles.playCircle}>
                    <Play size={24} color="#FFF" fill="#FFF" />
                  </View>
                </View>
                <View style={styles.durationBadge}>
                  <Clock size={10} color="#FFF" />
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>
              <View style={styles.videoMeta}>
                <Text style={[styles.videoTitle, { color: colors.text }]}>{video.title}</Text>
                <Text style={[styles.videoDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                  {video.description}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryEmoji}>{videoCategoryEmojis[video.category]}</Text>
                  <Text style={styles.categoryText}>{videoCategoryLabels[video.category]}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredVideos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Nenhum video nesta categoria
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20 },

  introSection: { alignItems: 'center', marginBottom: 24 },
  introEmoji: { fontSize: 40, marginBottom: 8 },
  introTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  introSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 20, paddingHorizontal: 2 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterEmoji: { fontSize: 14 },
  filterText: { fontSize: 13, fontWeight: '600' },

  videoList: { gap: 16 },
  videoCard: { borderRadius: 16, overflow: 'hidden', borderWidth: 1 },
  thumbnailContainer: { height: 180, position: 'relative' },
  thumbnailPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbnailEmoji: { fontSize: 60 },
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  playCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(139,92,246,0.8)', justifyContent: 'center', alignItems: 'center' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  durationText: { color: '#FFF', fontSize: 11, fontWeight: '600' },

  videoMeta: { padding: 14 },
  videoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  videoDesc: { fontSize: 13, lineHeight: 19, marginBottom: 10 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: 'rgba(139,92,246,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryEmoji: { fontSize: 12 },
  categoryText: { fontSize: 11, fontWeight: '600', color: '#D4A84B' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 15 },
});
