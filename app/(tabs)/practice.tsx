import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { recordPractice } from '../../lib/progressStore';
import { useTheme } from '../../lib/theme';

type Word = { id: string; word: string; meaning: string | null; definition: string | null; example_sentence: string | null };
type Mode = 'meaning' | 'typing' | 'mixed';
type Question = Word & { mode: 'meaning' | 'typing'; options: string[]; correctIndex: number };

const meaningOf = (w: Word) => w.meaning?.trim() || w.definition?.trim() || 'Meaning unavailable';
const normalize = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9\s'-]/g, '').replace(/\s+/g, ' ');
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);

function makeQuestion(word: Word, pool: Word[], mode: Mode): Question {
  const actualMode: 'meaning' | 'typing' = mode === 'mixed' ? (Math.random() > 0.5 ? 'meaning' : 'typing') : mode;
  const correct = meaningOf(word);
  const distractors = shuffle(pool.filter(item => item.id !== word.id && meaningOf(item) !== correct)).slice(0, 3).map(meaningOf);
  const options = shuffle([correct, ...distractors]);
  return { ...word, mode: actualMode, options, correctIndex: options.indexOf(correct) };
}

export default function PracticeScreen() {
  const { theme } = useTheme();
  const [pool, setPool] = useState<Word[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<Mode>('mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [customCount, setCustomCount] = useState('25');
  const [customSelected, setCustomSelected] = useState(false);
  const [timer, setTimer] = useState(15);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [remaining, setRemaining] = useState(timer);
  const [timedOut, setTimedOut] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFinished(false);
    setIndex(0);
    setSelected(null);
    setAnswer('');
    setCorrect(0);
    setTimedOut(false);

    const { data, error: fetchError } = await supabase
      .from('vocabulary')
      .select('id,word,meaning,definition,example_sentence')
      .limit(Math.max(220, questionCount * 8));

    if (fetchError || !data?.length) {
      setError(fetchError?.message || 'No vocabulary found.');
      setLoading(false);
      return;
    }

    const words = data.filter(item => item.word?.trim() && (item.meaning?.trim() || item.definition?.trim()));
    if (words.length < 4) {
      setError('Practice needs at least 4 vocabulary entries with meanings.');
      setLoading(false);
      return;
    }

    setPool(words);
    setQuestions(shuffle(words).slice(0, Math.min(questionCount, words.length)).map(word => makeQuestion(word, words, mode)));
    setRemaining(timer);
    setLoading(false);
  }, [mode, questionCount, timer]);

  useEffect(() => { load(); }, [load]);

  const current = questions[index];
  const submitted = selected !== null || timedOut;

  useEffect(() => {
    if (!current || submitted || timer === 0) return;
    setRemaining(timer);
    const interval = setInterval(() => {
      setRemaining(value => {
        if (value <= 1) {
          clearInterval(interval);
          setTimedOut(true);
          setSelected(-1);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [current, index, submitted, timer]);

  const isTypingCorrect = useMemo(() => current ? normalize(answer) === normalize(current.word) : false, [answer, current]);

  const submitTyping = () => {
    if (!current || submitted || !answer.trim()) return;
    setSelected(isTypingCorrect ? 0 : -2);
    if (isTypingCorrect) setCorrect(value => value + 1);
  };

  const choose = (choice: number) => {
    if (!current || submitted) return;
    setSelected(choice);
    if (choice === current.correctIndex) setCorrect(value => value + 1);
  };

  const next = () => {
    if (!current || !submitted) return;
    if (index === questions.length - 1) {
      const finalCorrect = correct;
      recordPractice(finalCorrect, questions.length);
      setFinished(true);
      return;
    }
    setIndex(value => value + 1);
    setSelected(null);
    setAnswer('');
    setTimedOut(false);
    setRemaining(timer);
  };

  const applyCustomCount = () => {
    const parsed = Number.parseInt(customCount, 10);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 200) return;
    setCustomSelected(false);
    setQuestionCount(parsed);
  };

  const center = (content: React.ReactNode) => <View style={[styles.center, { backgroundColor: theme.bg }]}>{content}</View>;

  if (loading) return center(<><ActivityIndicator color={theme.primary} /><Text style={[styles.muted, { color: theme.muted }]}>Preparing your practice session…</Text></>);

  if (error) return center(<><Text style={[styles.title, { color: theme.ink }]}>Practice unavailable</Text><Text style={[styles.muted, { color: theme.muted }]}>{error}</Text><Pressable style={[styles.primary, { backgroundColor: theme.primary }]} onPress={load}><Text style={styles.white}>Try again</Text></Pressable></>);

  if (finished) {
    const pct = questions.length ? Math.round(correct / questions.length * 100) : 0;
    const message = pct >= 90 ? 'Excellent recall.' : pct >= 70 ? 'Nice work. Keep going.' : 'Good start. Review and try again.';
    return center(<><Text style={[styles.eyebrow, { color: theme.primary }]}>SESSION COMPLETE</Text><Text style={[styles.title, { color: theme.ink }]}>Practice results</Text><Text style={[styles.score, { color: theme.primary }]}>{pct}%</Text><Text style={[styles.result, { color: theme.ink }]}>{correct} correct · {questions.length - correct} to review</Text><Text style={[styles.muted, { color: theme.muted }]}>{message}</Text><View style={styles.resultActions}><Pressable style={[styles.primary, { backgroundColor: theme.primary }]} onPress={load}><Text style={styles.white}>Practice again</Text></Pressable><Pressable style={[styles.secondary, { borderColor: theme.line }]} onPress={() => { setQuestions([]); setFinished(false); }}><Text style={[styles.secondaryText, { color: theme.ink }]}>Change mode</Text></Pressable></View></>);
  }

  if (!current) return center(<><Text style={[styles.title, { color: theme.ink }]}>No questions ready</Text><Pressable style={[styles.primary, { backgroundColor: theme.primary }]} onPress={load}><Text style={styles.white}>Start again</Text></Pressable></>);

  return <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: theme.bg }]} keyboardShouldPersistTaps="handled">
    <Text style={[styles.eyebrow, { color: theme.primary }]}>PRACTICE</Text>
    <View style={styles.heading}>
      <View><Text style={[styles.title, { color: theme.ink }]}>Build your recall.</Text><Text style={[styles.muted, { color: theme.muted }]}>Question {index + 1} of {questions.length}</Text></View>
      <Text style={[styles.timer, { color: remaining <= 3 && timer > 0 ? '#C0392B' : theme.primary }]}>{timer === 0 ? '∞' : `${remaining}s`}</Text>
    </View>

    <View style={[styles.progressTrack, { backgroundColor: theme.surfaceAlt }]}><View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${((index + 1) / questions.length) * 100}%` }]} /></View>

    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      {current.mode === 'meaning' ? <>
        <Text style={[styles.modeLabel, { color: theme.muted }]}>MEANING</Text>
        <Text style={[styles.prompt, { color: theme.ink }]}>What does <Text style={{ color: theme.primary, fontWeight: '900' }}>{current.word}</Text> mean?</Text>
        {current.options.map((option, choice) => <Pressable key={`${option}-${choice}`} onPress={() => choose(choice)} style={[styles.option, { borderColor: theme.line, backgroundColor: theme.surface }, submitted && choice === current.correctIndex && { borderColor: theme.primary, backgroundColor: theme.soft }, selected === choice && choice !== current.correctIndex && styles.wrong]}>
          <Text style={[styles.letter, { backgroundColor: theme.surfaceAlt, color: theme.muted }]}>{String.fromCharCode(65 + choice)}</Text><Text style={[styles.optionText, { color: theme.ink }]}>{option}</Text>
        </Pressable>)}
      </> : <>
        <Text style={[styles.modeLabel, { color: theme.muted }]}>TYPE THE WORD</Text>
        <Text style={[styles.prompt, { color: theme.ink }]}>Which English word matches this meaning?</Text>
        <View style={[styles.meaningBox, { backgroundColor: theme.surfaceAlt }]}><Text style={[styles.meaningText, { color: theme.ink }]}>{meaningOf(current)}</Text></View>
        <TextInput value={answer} onChangeText={setAnswer} editable={!submitted} autoCapitalize="none" autoCorrect={false} placeholder="Type the word…" placeholderTextColor={theme.muted} onSubmitEditing={submitTyping} style={[styles.input, { borderColor: theme.line, backgroundColor: theme.surface, color: theme.ink }]} />
        {!submitted && <Pressable disabled={!answer.trim()} onPress={submitTyping} style={[styles.next, { backgroundColor: theme.primary }, !answer.trim() && styles.disabled]}><Text style={styles.white}>Check answer</Text></Pressable>}
      </>}

      {submitted && <View style={[styles.feedback, { backgroundColor: selected === current.correctIndex || (current.mode === 'typing' && isTypingCorrect) ? theme.soft : theme.surfaceAlt }]}>
        <Text style={[styles.feedbackTitle, { color: selected === current.correctIndex || (current.mode === 'typing' && isTypingCorrect) ? theme.primary : '#C0392B' }]}>{timedOut ? "Time's up" : (selected === current.correctIndex || (current.mode === 'typing' && isTypingCorrect)) ? '✓ Correct' : '✕ Not quite'}</Text>
        <Text style={[styles.feedbackText, { color: theme.ink }]}>{current.mode === 'typing' ? `Answer: ${current.word}` : `Correct answer: ${current.options[current.correctIndex]}`}</Text>
      </View>}

      {current.example_sentence && <Text style={[styles.example, { backgroundColor: theme.surfaceAlt, color: theme.muted }]}>Example: {current.example_sentence}</Text>}
      {current.mode === 'meaning' && <Pressable disabled={!submitted} onPress={next} style={[styles.next, { backgroundColor: theme.primary }, !submitted && styles.disabled]}><Text style={styles.white}>{index === questions.length - 1 ? 'Finish session' : 'Next question →'}</Text></Pressable>}
      {current.mode === 'typing' && submitted && <Pressable onPress={next} style={[styles.next, { backgroundColor: theme.primary }]}><Text style={styles.white}>{index === questions.length - 1 ? 'Finish session' : 'Next question →'}</Text></Pressable>}
    </View>

    <View style={[styles.settings, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <Text style={[styles.settingsTitle, { color: theme.ink }]}>Session setup</Text>
      <Text style={[styles.settingLabel, { color: theme.muted }]}>Practice mode</Text>
      <View style={styles.row}>{([['mixed', 'Mixed'], ['meaning', 'Multiple choice'], ['typing', 'Type answer']] as const).map(([value, label]) => <Pressable key={value} onPress={() => { setMode(value); setQuestions([]); }} style={[styles.chip, { backgroundColor: theme.surfaceAlt }, mode === value && { backgroundColor: theme.soft, borderColor: theme.primary }]}><Text style={[styles.chipText, { color: theme.ink }]}>{label}</Text></Pressable>)}</View>
      <Text style={[styles.settingLabel, { color: theme.muted }]}>Questions</Text>
      <View style={styles.row}>
        {[5, 10, 20].map(value => <Pressable key={value} onPress={() => { setCustomSelected(false); setQuestionCount(value); }} style={[styles.chip, { backgroundColor: theme.surfaceAlt }, !customSelected && questionCount === value && { backgroundColor: theme.soft, borderColor: theme.primary }]}><Text style={[styles.chipText, { color: theme.ink }]}>{value}</Text></Pressable>)}
        <Pressable onPress={() => setCustomSelected(true)} style={[styles.chip, { backgroundColor: theme.surfaceAlt }, customSelected && { backgroundColor: theme.soft, borderColor: theme.primary }]}><Text style={[styles.chipText, { color: theme.ink }]}>Custom</Text></Pressable>
      </View>
      {customSelected && <View style={styles.customRow}>
        <TextInput value={customCount} onChangeText={value => setCustomCount(value.replace(/[^0-9]/g, '').slice(0, 3))} keyboardType="number-pad" maxLength={3} placeholder="1–200" placeholderTextColor={theme.muted} style={[styles.customInput, { borderColor: theme.line, backgroundColor: theme.surface, color: theme.ink }]} />
        <Pressable disabled={!Number.isInteger(Number.parseInt(customCount, 10)) || Number.parseInt(customCount, 10) < 1 || Number.parseInt(customCount, 10) > 200} onPress={applyCustomCount} style={[styles.applyButton, { backgroundColor: theme.primary }, (!Number.isInteger(Number.parseInt(customCount, 10)) || Number.parseInt(customCount, 10) < 1 || Number.parseInt(customCount, 10) > 200) && styles.disabled]}><Text style={styles.white}>Apply</Text></Pressable>
      </View>}
      <Text style={[styles.settingHint, { color: theme.muted }]}>Choose 5, 10, 20, or set any custom amount from 1 to 200.</Text>
      <Text style={[styles.settingLabel, { color: theme.muted }]}>Question timer</Text>
      <View style={styles.row}>{[0, 10, 15, 30].map(value => <Pressable key={value} onPress={() => { setTimer(value); setRemaining(value); }} style={[styles.chip, { backgroundColor: theme.surfaceAlt }, timer === value && { backgroundColor: theme.soft, borderColor: theme.primary }]}><Text style={[styles.chipText, { color: theme.ink }]}>{value === 0 ? '∞' : `${value}s`}</Text></Pressable>)}</View>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 20, paddingTop: 24, paddingBottom: 50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: '900', marginTop: 5 },
  muted: { fontSize: 13, lineHeight: 19 },
  heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  timer: { fontWeight: '900', fontSize: 16, marginTop: 10 },
  progressTrack: { height: 5, borderRadius: 3, overflow: 'hidden', maxWidth: 760, width: '100%', alignSelf: 'center', marginBottom: 16 },
  progressFill: { height: '100%', borderRadius: 3 },
  card: { borderRadius: 22, borderWidth: 1, padding: 20, maxWidth: 760, width: '100%', alignSelf: 'center' },
  modeLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  prompt: { fontSize: 24, lineHeight: 32, fontWeight: '800', marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 13, marginBottom: 9 },
  wrong: { borderColor: '#E88B8B', backgroundColor: '#FFF5F5' },
  letter: { width: 30, height: 30, borderRadius: 15, textAlign: 'center', paddingTop: 6, fontWeight: '900' },
  optionText: { flex: 1, fontSize: 14, fontWeight: '600' },
  meaningBox: { padding: 16, borderRadius: 14, marginBottom: 14 },
  meaningText: { fontSize: 16, lineHeight: 23, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, fontSize: 16, marginBottom: 4 },
  feedback: { borderRadius: 14, padding: 13, marginTop: 8 },
  feedbackTitle: { fontWeight: '900', marginBottom: 3 },
  feedbackText: { fontSize: 13, lineHeight: 19 },
  example: { padding: 12, borderRadius: 12, marginTop: 12, lineHeight: 19 },
  next: { borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 16 },
  disabled: { opacity: 0.45 },
  white: { color: '#fff', fontWeight: '900' },
  primary: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  secondary: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  secondaryText: { fontWeight: '900' },
  score: { fontSize: 54, fontWeight: '900', marginTop: 12 },
  result: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  resultActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  settings: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 14, maxWidth: 760, width: '100%', alignSelf: 'center' },
  settingsTitle: { fontWeight: '900', fontSize: 15 },
  settingLabel: { fontSize: 11, fontWeight: '800', marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.7 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  customRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 10 },
  customInput: { width: 100, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, fontSize: 14, fontWeight: '700' },
  applyButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  settingHint: { fontSize: 12, lineHeight: 18, marginTop: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'transparent' },
  chipText: { fontWeight: '800' },
});