import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, BookOpen, Volume2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/contexts/AppContext';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import {
  getBooks,
  getChapter,
  getTestament,
  translationToVersion,
  type BibleBook,
  type BibleVerse,
  type BibleVersion,
} from '@/services/bibliaDigital';

type Screen = 'books' | 'chapters' | 'reading';

interface SelectedBook {
  bookId: number;
  name: string;
  chapters: number;
  testament: 'VT' | 'NT';
}

export default function BibleScreen() {
  const router = useRouter();
  const { colors, state } = useApp();
  const version = translationToVersion(state.preferredTranslation);

  const [screen, setScreen] = useState<Screen>('books');
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<SelectedBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testament, setTestament] = useState<'VT' | 'NT'>('VT');
  const [showAudio, setShowAudio] = useState(false);

  // Load books
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error: err } = await getBooks(version);
      if (data) setBooks(data);
      if (err) setError(err);
      setLoading(false);
    };
    void load();
  }, [version]);

  // Load chapter
  const loadChapter = useCallback(async (bookId: number, chapter: number, ver: BibleVersion) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await getChapter(ver, bookId, chapter);
    if (data) {
      setVerses(data);
    }
    if (err) setError(err);
    setLoading(false);
  }, []);

  const selectBook = useCallback((book: BibleBook) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedBook({
      bookId: book.bookid,
      name: book.name,
      chapters: book.chapters,
      testament: getTestament(book.bookid),
    });
    setScreen('chapters');
  }, []);

  const selectChapter = useCallback((chapter: number) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChapter(chapter);
    setScreen('reading');
    void loadChapter(selectedBook!.bookId, chapter, version);
  }, [selectedBook, version, loadChapter]);

  const goBack = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (screen === 'reading') {
      setScreen('chapters');
      setVerses([]);
      setShowAudio(false);
    } else if (screen === 'chapters') {
      setScreen('books');
      setSelectedBook(null);
    } else {
      router.back();
    }
  }, [screen, router]);

  const navigateChapter = useCallback((dir: -1 | 1) => {
    if (!selectedBook) return;
    const next = selectedChapter + dir;
    if (next < 1 || next > selectedBook.chapters) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChapter(next);
    void loadChapter(selectedBook.bookId, next, version);
  }, [selectedBook, selectedChapter, version, loadChapter]);

  const filteredBooks = books.filter(b => getTestament(b.bookid) === testament);

  // ─── Book List ───────────────────────────
  const renderBooks = () => (
    <>
      <View style={styles.testamentTabs}>
        <TouchableOpacity
          style={[styles.testamentTab, testament === 'VT' && styles.testamentTabActive]}
          onPress={() => setTestament('VT')}
        >
          <Text style={[styles.testamentTabText, testament === 'VT' && styles.testamentTabTextActive]}>
            Antigo Testamento
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testamentTab, testament === 'NT' && styles.testamentTabActive]}
          onPress={() => setTestament('NT')}
        >
          <Text style={[styles.testamentTabText, testament === 'NT' && styles.testamentTabTextActive]}>
            Novo Testamento
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D4A84B" />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Carregando livros...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setError(null); setLoading(true); void getBooks(version).then(r => { if (r.data) setBooks(r.data); setLoading(false); }); }}>
            <Text style={styles.retryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.bookid.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.bookList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.bookItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => selectBook(item)}
              activeOpacity={0.7}
            >
              <View style={styles.bookIcon}>
                <BookOpen size={18} color="#D4A84B" />
              </View>
              <View style={styles.bookInfo}>
                <Text style={[styles.bookName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.bookMeta, { color: colors.textMuted }]}>
                  {item.chapters} capítulos
                </Text>
              </View>
              <ChevronRight size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        />
      )}
    </>
  );

  // ─── Chapter List ────────────────────────
  const renderChapters = () => {
    if (!selectedBook) return null;
    const chapters = Array.from({ length: selectedBook.chapters }, (_, i) => i + 1);
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.chapterContent}>
        <Text style={[styles.chapterBookName, { color: colors.text }]}>{selectedBook.name}</Text>
        <Text style={[styles.chapterSubtitle, { color: colors.textMuted }]}>
          Selecione um capítulo
        </Text>
        <View style={styles.chapterGrid}>
          {chapters.map(ch => (
            <TouchableOpacity
              key={ch}
              style={[styles.chapterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => selectChapter(ch)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chapterNum, { color: colors.text }]}>{ch}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ─── Reading ─────────────────────────────
  const renderReading = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.readingContent}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D4A84B" />
          <Text style={[styles.loadingText, { color: colors.textMuted }]}>Carregando...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : (
        <>
          <View style={styles.readingHeader}>
            <Text style={[styles.readingTitle, { color: colors.text }]}>
              {selectedBook?.name} {selectedChapter}
            </Text>
            <Text style={[styles.readingVersion, { color: colors.textMuted }]}>
              {state.preferredTranslation}
            </Text>
          </View>
          {/* Audio button - prominent */}
          {!showAudio && verses.length > 0 && (
            <TouchableOpacity
              onPress={() => setShowAudio(true)}
              style={styles.listenBtn}
              activeOpacity={0.7}
            >
              <Volume2 size={18} color="#C5943A" />
              <Text style={styles.listenBtnText}>Ouvir capítulo</Text>
            </TouchableOpacity>
          )}
          {showAudio && verses.length > 0 && (
            <AudioPlayerBar
              text={verses.map(v => v.text).join(' ')}
              title={`${selectedBook?.name} ${selectedChapter}`}
              onClose={() => setShowAudio(false)}
            />
          )}
          <View style={styles.versesContainer}>
            {verses.map(v => (
              <Text key={v.verse} style={[styles.verseText, { color: colors.textSecondary }]}>
                <Text style={styles.verseNumber}>{v.verse} </Text>
                {v.text}
              </Text>
            ))}
          </View>
          <View style={styles.chapterNav}>
            <TouchableOpacity
              style={[styles.chapterNavBtn, { backgroundColor: colors.card, borderColor: colors.border }, selectedChapter <= 1 && styles.chapterNavBtnDisabled]}
              onPress={() => navigateChapter(-1)}
              disabled={selectedChapter <= 1}
            >
              <ArrowLeft size={16} color={selectedChapter <= 1 ? colors.textMuted : '#D4A84B'} />
              <Text style={[styles.chapterNavText, { color: selectedChapter <= 1 ? colors.textMuted : '#D4A84B' }]}>
                Anterior
              </Text>
            </TouchableOpacity>
            <Text style={[styles.chapterNavCurrent, { color: colors.textMuted }]}>
              {selectedChapter} / {selectedBook?.chapters}
            </Text>
            <TouchableOpacity
              style={[styles.chapterNavBtn, { backgroundColor: colors.card, borderColor: colors.border }, selectedChapter >= (selectedBook?.chapters || 1) && styles.chapterNavBtnDisabled]}
              onPress={() => navigateChapter(1)}
              disabled={selectedChapter >= (selectedBook?.chapters || 1)}
            >
              <Text style={[styles.chapterNavText, { color: selectedChapter >= (selectedBook?.chapters || 1) ? colors.textMuted : '#D4A84B' }]}>
                Próximo
              </Text>
              <ChevronRight size={16} color={selectedChapter >= (selectedBook?.chapters || 1) ? colors.textMuted : '#D4A84B'} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );

  const title = screen === 'books' ? 'Bíblia' : screen === 'chapters' ? selectedBook?.name || '' : `${selectedBook?.name} ${selectedChapter}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
        <View style={styles.headerRight} />
      </View>

      {screen === 'books' && renderBooks()}
      {screen === 'chapters' && renderChapters()}
      {screen === 'reading' && renderReading()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  headerRight: { width: 30 },

  // Testament tabs
  testamentTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    padding: 3,
  },
  testamentTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  testamentTabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  testamentTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  testamentTabTextActive: {
    color: '#D4A84B',
  },

  // Book list
  bookList: { padding: 16, gap: 6 },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  bookIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookInfo: { flex: 1 },
  bookName: { fontSize: 15, fontWeight: '600' },
  bookMeta: { fontSize: 12, marginTop: 2 },

  // Chapter grid
  chapterContent: { padding: 20 },
  chapterBookName: { fontSize: 24, fontWeight: '800', marginBottom: 4 },
  chapterSubtitle: { fontSize: 14, marginBottom: 20 },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chapterBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNum: { fontSize: 16, fontWeight: '600' },

  // Reading
  readingContent: { padding: 20, paddingBottom: 40 },
  readingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(197, 148, 58, 0.12)',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(197, 148, 58, 0.2)',
  },
  listenBtnText: {
    color: '#C5943A',
    fontSize: 15,
    fontWeight: '600',
  },
  readingTitle: { fontSize: 22, fontWeight: '800' },
  readingVersion: { fontSize: 13, fontWeight: '600' },
  versesContainer: { marginBottom: 30 },
  verseText: {
    fontSize: 17,
    lineHeight: 30,
    marginBottom: 4,
  },
  verseNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4A84B',
  },

  // Chapter navigation
  chapterNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  chapterNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  chapterNavBtnDisabled: { opacity: 0.4 },
  chapterNavText: { fontSize: 13, fontWeight: '600' },
  chapterNavCurrent: { fontSize: 13, fontWeight: '500' },

  // States
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorText: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: '#D4A84B', fontWeight: '600', fontSize: 14 },
});
