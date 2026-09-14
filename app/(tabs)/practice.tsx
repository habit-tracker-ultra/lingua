import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const options = ['Able to recover quickly', 'Very strict or exact', 'Uncertain or final', 'To draw out a response'];

export default function PracticeScreen() {
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(5);
  const [revealed, setRevealed] = useState(false);
  const correct = 0;
  const status = useMemo(() => selected === null ? 'Choose an answer' : selected === correct ? '✓ Correct' : '✕ Incorrect', [selected]);

  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>PRACTICE</Text>
      <Text style={styles.title}>Custom practice.</Text>
      <Text style={styles.subtitle}>This is the foundation for flashcards, MCQs, typing and timed sessions.</Text>

      <View style={styles.card}>
        <View style={styles.top}><Text style={styles.tag}>MCQ · 1 / 20</Text><Text style={styles.timer}>{seconds}s</Text></View>
        <Text style={styles.prompt}>What does <Text style={styles.bold}>resilient</Text> mean?</Text>
        {options.map((option, index) => (
          <Pressable key={option} onPress={() => setSelected(index)} style={[styles.option, selected === index && styles.selected]}>
            <Text style={styles.optionLetter}>{String.fromCharCode(65 + index)}</Text>
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
        <Text style={[styles.status, selected !== null && selected !== correct ? styles.wrong : null]}>{status}</Text>
        {selected !== null && selected !== correct && <Text style={styles.answer}>Correct answer: Able to recover quickly</Text>}
        <Pressable onPress={() => setRevealed(!revealed)} style={styles.settings}><Text style={styles.settingsText}>{revealed ? 'Hide' : 'Show'} timing settings</Text></Pressable>
        {revealed && (
          <View style={styles.settingsBox}>
            <Text style={styles.settingsTitle}>Question timer</Text>
            <View style={styles.timerRow}>
              {[0, 5, 10, 15, 30].map((value) => <Pressable key={value} onPress={() => setSeconds(value)} style={styles.timerChip}><Text style={styles.timerChipText}>{value === 0 ? '∞' : `${value}s`}</Text></Pressable>)}
            </View>
            <Text style={styles.small}>Wrong/timeout reveal: 2 seconds by default.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F7FB', padding: 20, paddingTop: 24 },
  eyebrow: { color: '#5B5CE2', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#172033', fontSize: 30, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#667085', fontSize: 14, lineHeight: 20, marginTop: 7, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#E7E9F0', padding: 20, maxWidth: 760, width: '100%', alignSelf: 'center' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { color: '#5B5CE2', backgroundColor: '#EEEFFF', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 99, fontSize: 11, fontWeight: '900' },
  timer: { color: '#C56B22', fontWeight: '900' },
  prompt: { color: '#172033', fontSize: 26, lineHeight: 32, fontWeight: '850', marginVertical: 24 },
  bold: { color: '#5B5CE2' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E7E9F0', borderRadius: 14, padding: 13, marginBottom: 9 },
  selected: { borderColor: '#5B5CE2', backgroundColor: '#F3F3FF' },
  optionLetter: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F1F6', textAlign: 'center', textAlignVertical: 'center', paddingTop: 6, color: '#596174', fontWeight: '900' },
  optionText: { color: '#273047', flex: 1, fontSize: 14, fontWeight: '650' },
  status: { color: '#168A5B', fontWeight: '900', marginTop: 8 },
  wrong: { color: '#C56B22' },
  answer: { color: '#596174', backgroundColor: '#F8F8FC', padding: 12, borderRadius: 12, marginTop: 9 },
  settings: { alignSelf: 'flex-start', marginTop: 18 },
  settingsText: { color: '#5B5CE2', fontWeight: '800' },
  settingsBox: { marginTop: 14, borderTopWidth: 1, borderTopColor: '#EEF0F5', paddingTop: 14 },
  settingsTitle: { color: '#172033', fontWeight: '900' },
  timerRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 10 },
  timerChip: { backgroundColor: '#F0F1F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  timerChipText: { color: '#273047', fontWeight: '800' },
  small: { color: '#667085', fontSize: 12, marginTop: 10 },
});
