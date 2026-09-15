import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

type CardWord = { id: string; word: string; meaning: string | null; definition: string | null; example_sentence: string | null; pronunciation: string | null; level: string | null };
type HistoryRow = { id: string; word: string; result: 'known' | 'review'; created_at: string };
const PAGE_SIZE = 20;

export default function FlashcardsScreen() {
  const { theme } = useTheme();
  const [cards, setCards] = useState<CardWord[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [known, setKnown] = useState(0);
  const [learning, setLearning] = useState(0);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    const { data } = await supabase.from('flashcard_history').select('id,word,result,created_at').order('created_at', { ascending: false }).limit(30);
    setHistory((data ?? []) as HistoryRow[]);
  }, []);

  const loadCards = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('vocabulary').select('id, word, meaning, definition, example_sentence, pronunciation, level').order('id', { ascending: true }).range(0, PAGE_SIZE - 1);
    if (!error) setCards(data ?? []);
    setIndex(0);
    setFlipped(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCards();
    void loadHistory();
  }, [loadCards, loadHistory]);

  const finishCard = async (wasKnown: boolean) => {
    const current = cards[index];
    if (!current) return;
    if (wasKnown) setKnown((value) => value + 1);
    else setLearning((value) => value + 1);
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from('flashcard_history').insert({ user_id: user.user.id, vocabulary_id: current.id, word: current.word, result: wasKnown ? 'known' : 'review' });
      await loadHistory();
    }
    setFlipped(false);
    setIndex((value) => value + 1);
  };

  if (loading) return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator color={theme.primary} /><Text style={[styles.muted, { color: theme.muted }]}>Loading flashcards…</Text></View>;

  if (!cards.length) return <View style={[styles.center, { backgroundColor: theme.bg }]}><Text style={[styles.title, { color: theme.ink }]}>No flashcards yet</Text><Text style={[styles.muted, { color: theme.muted }]}>Import vocabulary first, then come back here.</Text><Pressable onPress={() => router.push('/import')} style={[styles.button, { backgroundColor: theme.primary }]}><Text style={styles.buttonText}>Open Import</Text></Pressable></View>;

  if (index >= cards.length) return <ScrollView contentContainerStyle={[styles.center, { backgroundColor: theme.bg }]}><Text style={[styles.eyebrow, { color: theme.primary }]}>SESSION COMPLETE</Text><Text style={[styles.title, { color: theme.ink }]}>Great work.</Text><Text style={[styles.summary, { color: theme.muted }]}>You knew {known} and need to review {learning} of {cards.length} words.</Text><View style={styles.row}><Pressable onPress={loadCards} style={[styles.button, { backgroundColor: theme.primary }]}><Text style={styles.buttonText}>New deck</Text></Pressable><Pressable onPress={() => setShowHistory((value) => !value)} style={[styles.secondary, { borderColor: theme.line, backgroundColor: theme.surface }]}><Text style={[styles.secondaryText, { color: theme.ink }]}>Previous cards</Text></Pressable></View>{showHistory ? <History history={history} theme={theme} /> : null}</ScrollView>;

  const current = cards[index];
  return <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: theme.bg }]}>
    <View style={styles.header}><View><Text style={[styles.eyebrow, { color: theme.primary }]}>FLASHCARDS</Text><Text style={[styles.title, { color: theme.ink }]}>Recall, then reveal.</Text><Text style={[styles.subtitle, { color: theme.muted }]}>Think of the meaning before you flip the card.</Text></View><View style={[styles.progressPill, { backgroundColor: theme.soft }]}><Text style={[styles.progressText, { color: theme.primary }]}>{index + 1} / {cards.length}</Text></View></View>
    <Pressable onPress={() => setFlipped((value) => !value)} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      {!flipped ? <><Text style={[styles.level, { color: theme.primary, backgroundColor: theme.soft }]}>{current.level || 'WORD'}</Text><Text style={[styles.word, { color: theme.ink }]}>{current.word}</Text>{current.pronunciation ? <Text style={[styles.pronunciation, { color: theme.muted }]}>{current.pronunciation}</Text> : null}<Text style={[styles.flipHint, { color: theme.primary }]}>Tap to reveal meaning ↻</Text></> : <><Text style={[styles.revealedLabel, { color: theme.primary }]}>MEANING</Text><Text style={[styles.meaning, { color: theme.ink }]}>{current.meaning || current.definition || 'Meaning not available'}</Text>{current.definition && current.definition !== current.meaning ? <Text style={[styles.definition, { color: theme.muted }]}>{current.definition}</Text> : null}{current.example_sentence ? <View style={[styles.example, { backgroundColor: theme.surfaceAlt }]}><Text style={[styles.exampleLabel, { color: theme.primary }]}>EXAMPLE</Text><Text style={[styles.exampleText, { color: theme.ink }]}>{current.example_sentence}</Text></View> : null}<Text style={[styles.flipHint, { color: theme.primary }]}>Tap to hide ↺</Text></>}
    </Pressable>
    <View style={styles.actions}><Pressable disabled={!flipped} onPress={() => finishCard(false)} style={[styles.action, { backgroundColor: theme.surface, borderColor: theme.line }, !flipped && styles.disabled]}><Text style={[styles.actionTitle, { color: theme.ink }]}>↻ Review</Text><Text style={[styles.actionMeta, { color: theme.muted }]}>Need practice</Text></Pressable><Pressable disabled={!flipped} onPress={() => finishCard(true)} style={[styles.action, { backgroundColor: theme.primary }, !flipped && styles.disabled]}><Text style={styles.actionTitleLight}>✓ Know it</Text><Text style={styles.actionMetaLight}>Next card</Text></Pressable></View>
    <Text style={[styles.stats, { color: theme.muted }]}>Known {known} · Review {learning}</Text>
    <Pressable onPress={() => setShowHistory((value) => !value)} style={[styles.historyToggle, { backgroundColor: theme.surface, borderColor: theme.line }]}><Text style={[styles.historyToggleText, { color: theme.primary }]}>{showHistory ? 'Hide' : 'Show'} previous flashcards</Text></Pressable>
    {showHistory ? <History history={history} theme={theme} /> : null}
  </ScrollView>;
}

function History({ history, theme }: { history: HistoryRow[]; theme: any }) {
  return <View style={[styles.history, { backgroundColor: theme.surface, borderColor: theme.line }]}><Text style={[styles.historyTitle, { color: theme.ink }]}>Previous flashcards</Text>{history.length ? history.map((item) => <View key={item.id} style={[styles.historyRow, { borderBottomColor: theme.line }]}><Text style={[styles.historyWord, { color: theme.ink }]}>{item.word}</Text><Text style={[styles.historyResult, { color: item.result === 'known' ? theme.primary : theme.muted }]}>{item.result === 'known' ? '✓ Known' : '↻ Review'}</Text><Text style={[styles.historyDate, { color: theme.muted }]}>{new Date(item.created_at).toLocaleString()}</Text></View>) : <Text style={[styles.muted, { color: theme.muted }]}>No previous cards yet.</Text>}</View>;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 24, paddingBottom: 40, maxWidth: 900, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: '900', marginTop: 5 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 7 },
  progressPill: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  progressText: { fontWeight: '900', fontSize: 12 },
  card: { minHeight: 380, borderRadius: 28, borderWidth: 1, marginTop: 22, padding: 28, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  level: { fontSize: 10, fontWeight: '900', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, overflow: 'hidden' },
  word: { fontSize: 48, fontWeight: '900', marginTop: 20 },
  pronunciation: { fontSize: 15, marginTop: 8 },
  flipHint: { fontSize: 12, fontWeight: '800', marginTop: 38 },
  revealedLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  meaning: { fontSize: 26, fontWeight: '900', textAlign: 'center', marginTop: 10, maxWidth: 680 },
  definition: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 9, maxWidth: 650 },
  example: { width: '100%', maxWidth: 620, borderRadius: 15, padding: 15, marginTop: 22 },
  exampleLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  exampleText: { fontSize: 14, lineHeight: 20, marginTop: 5 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  action: { flex: 1, borderRadius: 15, borderWidth: 1, padding: 15, alignItems: 'center' },
  actionTitle: { fontSize: 14, fontWeight: '900' },
  actionTitleLight: { color: '#fff', fontSize: 14, fontWeight: '900' },
  actionMeta: { fontSize: 11, marginTop: 3 },
  actionMetaLight: { color: '#fff', opacity: 0.8, fontSize: 11, marginTop: 3 },
  disabled: { opacity: 0.45 },
  stats: { fontSize: 11, textAlign: 'center', marginTop: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: { fontSize: 13, marginTop: 9 },
  summary: { fontSize: 15, textAlign: 'center', maxWidth: 500, lineHeight: 22, marginTop: 8 },
  button: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginTop: 18 },
  buttonText: { color: '#fff', fontWeight: '900' },
  secondary: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, marginTop: 18 },
  secondaryText: { fontWeight: '900' },
  row: { flexDirection: 'row', gap: 10 },
  historyToggle: { alignSelf: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 14 },
  historyToggleText: { fontSize: 12, fontWeight: '900' },
  history: { width: '100%', borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 14 },
  historyTitle: { fontSize: 17, fontWeight: '900', marginBottom: 8 },
  historyRow: { paddingVertical: 10, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  historyWord: { fontWeight: '900', flex: 1 },
  historyResult: { fontSize: 11, fontWeight: '800' },
  historyDate: { fontSize: 9 },
});
