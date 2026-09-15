import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type VocabularyWord = {
  id: string;
  word: string;
  meaning: string | null;
  definition: string | null;
  example_sentence: string | null;
  level: string | null;
  pronunciation: string | null;
  part_of_speech?: string | null;
  source_file?: string | null;
};

const PAGE_SIZE = 30;

function cleanSearch(value: string) {
  return value.replace(/[,%()]/g, ' ').trim();
}

function displayMeaning(item: VocabularyWord) {
  return item.meaning || item.definition || 'Meaning not available';
}

export default function VocabularyScreen() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VocabularyWord | null>(null);
  const [showMeaningOnly, setShowMeaningOnly] = useState(false);
  const wordCountRef = useRef(0);

  const hasMore = words.length < totalWords;
  const normalizedSearch = useMemo(() => cleanSearch(search), [search]);

  const loadVocabulary = useCallback(async (reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    setError(null);

    const from = reset ? 0 : wordCountRef.current;
    const to = from + PAGE_SIZE - 1;

    let dataQuery = supabase
      .from('vocabulary')
      .select('id, word, meaning, definition, example_sentence, level, pronunciation, part_of_speech, source_file')
      .order('normalized_word', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to);

    let countQuery = supabase.from('vocabulary').select('id', { count: 'exact', head: true });

    if (normalizedSearch) {
      const filter = `word.ilike.%${normalizedSearch}%,meaning.ilike.%${normalizedSearch}%,definition.ilike.%${normalizedSearch}%`;
      dataQuery = dataQuery.or(filter);
      countQuery = countQuery.or(filter);
    }

    const [dataResult, countResult] = await Promise.all([dataQuery, countQuery]);

    if (dataResult.error) {
      setError(dataResult.error.message);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    if (countResult.error) {
      setError(countResult.error.message);
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const nextWords = dataResult.data ?? [];
    if (reset) {
      wordCountRef.current = nextWords.length;
      setWords(nextWords);
    } else {
      wordCountRef.current += nextWords.length;
      setWords((current) => [...current, ...nextWords]);
    }

    setTotalWords(countResult.count ?? 0);
    setLoading(false);
    setLoadingMore(false);
  }, [normalizedSearch]);

  useEffect(() => {
    const timer = setTimeout(() => loadVocabulary(true), 250);
    return () => clearTimeout(timer);
  }, [loadVocabulary]);

  async function refresh() {
    setRefreshing(true);
    await loadVocabulary(true);
    setRefreshing(false);
  }

  const renderItem = ({ item }: { item: VocabularyWord }) => (
    <Pressable style={styles.wordRow} onPress={() => setSelected(item)}>
      <View style={styles.wordInfo}>
        <View style={styles.wordTitleRow}>
          <Text style={styles.word}>{item.word}</Text>
          {item.level ? <Text style={styles.level}>{item.level}</Text> : null}
        </View>
        <Text style={styles.meaning} numberOfLines={showMeaningOnly ? 1 : 2}>{displayMeaning(item)}</Text>
        {!showMeaningOnly && item.definition && item.definition !== item.meaning ? (
          <Text style={styles.definition} numberOfLines={1}>{item.definition}</Text>
        ) : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#5B5CE2" />}
        ListHeaderComponent={
          <>
            <Text style={styles.eyebrow}>VOCABULARY</Text>
            <Text style={styles.title}>Your word library.</Text>
            <Text style={styles.subtitle}>Search your complete Lingua vocabulary and open any word for its full details.</Text>

            <View style={styles.actions}>
              <Pressable style={styles.primary} onPress={() => router.push('/practice')}>
                <Text style={styles.primaryText}>Create practice</Text>
              </Pressable>
              <View style={styles.counter}>
                <Text style={styles.counterText}>{totalWords.toLocaleString()} records</Text>
              </View>
            </View>

            <View style={styles.searchBox}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search word, meaning or definition"
                placeholderTextColor="#98A2B3"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {search.length > 0 ? (
                <Pressable onPress={() => setSearch('')} style={styles.clearButton}>
                  <Text style={styles.clearText}>×</Text>
                </Pressable>
              ) : null}
            </View>

            <View style={styles.toolsRow}>
              <Pressable onPress={() => setShowMeaningOnly((value) => !value)} style={[styles.filterChip, showMeaningOnly && styles.filterChipActive]}>
                <Text style={[styles.filterText, showMeaningOnly && styles.filterTextActive]}>
                  {showMeaningOnly ? 'Compact list' : 'Show definitions'}
                </Text>
              </Pressable>
              <Text style={styles.resultText}>{normalizedSearch ? `${totalWords.toLocaleString()} matches` : 'Tap a word for details'}</Text>
            </View>

            {loading ? (
              <View style={styles.loading}>
                <ActivityIndicator color="#5B5CE2" />
                <Text style={styles.loadingText}>Loading vocabulary…</Text>
              </View>
            ) : null}

            {!loading && error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Couldn’t load vocabulary</Text>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable style={styles.retry} onPress={() => loadVocabulary(true)}><Text style={styles.retryText}>Try again</Text></Pressable>
              </View>
            ) : null}

            {!loading && !error && words.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>No words found</Text>
                <Text style={styles.emptyText}>Try a different search term.</Text>
              </View>
            ) : null}
          </>
        }
        ListFooterComponent={
          !loading && !error && hasMore ? (
            <Pressable style={styles.loadMore} onPress={() => loadVocabulary(false)} disabled={loadingMore}>
              {loadingMore ? <ActivityIndicator color="#5B5CE2" /> : <Text style={styles.loadMoreText}>Load more words</Text>}
            </Pressable>
          ) : !loading && !error && words.length > 0 ? (
            <Text style={styles.endText}>End of this vocabulary view</Text>
          ) : null
        }
      />

      <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Text style={styles.modalWord}>{selected?.word}</Text>
                {selected?.level ? <Text style={styles.level}>{selected.level}</Text> : null}
              </View>
              <Pressable onPress={() => setSelected(null)} style={styles.closeButton}><Text style={styles.closeText}>×</Text></Pressable>
            </View>

            {selected?.pronunciation ? <Text style={styles.pronunciation}>{selected.pronunciation}</Text> : null}

            <Text style={styles.detailLabel}>Meaning</Text>
            <Text style={styles.detailText}>{selected ? displayMeaning(selected) : ''}</Text>

            {selected?.definition ? (
              <>
                <Text style={styles.detailLabel}>Definition</Text>
                <Text style={styles.detailText}>{selected.definition}</Text>
              </>
            ) : null}

            {selected?.example_sentence ? (
              <>
                <Text style={styles.detailLabel}>Example</Text>
                <Text style={styles.exampleText}>{selected.example_sentence}</Text>
              </>
            ) : null}

            {selected?.part_of_speech ? <Text style={styles.metaDetail}>Part of speech · {selected.part_of_speech}</Text> : null}
            {selected?.source_file ? <Text style={styles.metaDetail}>Source · {selected.source_file}</Text> : null}

            <Pressable style={styles.modalPractice} onPress={() => { setSelected(null); router.push('/practice'); }}>
              <Text style={styles.modalPracticeText}>Practice this word →</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { padding: 20, paddingTop: 24, paddingBottom: 36 },
  eyebrow: { color: '#5B5CE2', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#172033', fontSize: 30, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#667085', fontSize: 14, lineHeight: 20, marginTop: 7, marginBottom: 16 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  primary: { backgroundColor: '#5B5CE2', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12 },
  primaryText: { color: '#fff', fontWeight: '900' },
  counter: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F0', paddingHorizontal: 13, paddingVertical: 11, borderRadius: 12 },
  counterText: { color: '#596174', fontSize: 12, fontWeight: '800' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9DCE5', borderRadius: 14, paddingHorizontal: 12, minHeight: 50 },
  searchIcon: { color: '#667085', fontSize: 24, marginRight: 6, lineHeight: 26 },
  input: { flex: 1, color: '#172033', fontSize: 14, paddingVertical: 12 },
  clearButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EEF0F5', alignItems: 'center', justifyContent: 'center' },
  clearText: { color: '#667085', fontSize: 22, lineHeight: 24 },
  toolsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  filterChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F0', borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 },
  filterChipActive: { backgroundColor: '#EEEFFF', borderColor: '#C9CAFF' },
  filterText: { color: '#596174', fontSize: 12, fontWeight: '800' },
  filterTextActive: { color: '#5B5CE2' },
  resultText: { color: '#667085', fontSize: 12 },
  loading: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F0', borderRadius: 16, padding: 20, alignItems: 'center', gap: 9, marginBottom: 12 },
  loadingText: { color: '#667085', fontSize: 13 },
  errorBox: { backgroundColor: '#FFF4F4', borderRadius: 14, padding: 14, marginBottom: 12 },
  errorTitle: { color: '#B42318', fontSize: 14, fontWeight: '900' },
  errorText: { color: '#667085', fontSize: 12, marginTop: 5, lineHeight: 18 },
  retry: { alignSelf: 'flex-start', backgroundColor: '#5B5CE2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, marginTop: 10 },
  retryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  emptyBox: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F0', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 12 },
  emptyTitle: { color: '#172033', fontWeight: '900', fontSize: 16 },
  emptyText: { color: '#667085', marginTop: 5, fontSize: 12 },
  wordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F0', borderRadius: 15, padding: 14, marginBottom: 8 },
  wordInfo: { flex: 1, paddingRight: 10 },
  wordTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  word: { color: '#172033', fontSize: 15, fontWeight: '800' },
  meaning: { color: '#667085', fontSize: 12, lineHeight: 18, marginTop: 3 },
  definition: { color: '#98A2B3', fontSize: 11, lineHeight: 16, marginTop: 2 },
  level: { color: '#5B5CE2', backgroundColor: '#EEEFFF', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, fontSize: 10, fontWeight: '900', overflow: 'hidden' },
  chevron: { color: '#98A2B3', fontSize: 26, lineHeight: 26 },
  loadMore: { minHeight: 46, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9DCE5', alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 8 },
  loadMoreText: { color: '#5B5CE2', fontWeight: '900' },
  endText: { color: '#98A2B3', fontSize: 11, textAlign: 'center', paddingVertical: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(23,32,51,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, maxHeight: '82%' },
  modalHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  modalTitleWrap: { flex: 1, paddingRight: 12 },
  modalWord: { color: '#172033', fontSize: 30, fontWeight: '900' },
  closeButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F0F1F6', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#667085', fontSize: 24, lineHeight: 25 },
  pronunciation: { color: '#5B5CE2', fontSize: 13, fontWeight: '800', marginTop: 6 },
  detailLabel: { color: '#172033', fontSize: 13, fontWeight: '900', marginTop: 18, marginBottom: 5 },
  detailText: { color: '#4B5568', fontSize: 14, lineHeight: 21 },
  exampleText: { color: '#4B5568', backgroundColor: '#F7F7FB', borderRadius: 12, padding: 12, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },
  metaDetail: { color: '#98A2B3', fontSize: 11, marginTop: 12 },
  modalPractice: { backgroundColor: '#5B5CE2', borderRadius: 13, alignItems: 'center', paddingVertical: 13, marginTop: 20 },
  modalPracticeText: { color: '#fff', fontWeight: '900' },
});
