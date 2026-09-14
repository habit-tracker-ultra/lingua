import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const words = [
  ['Resilient', 'Able to recover quickly from difficulty'],
  ['Stringent', 'Very strict or exact'],
  ['Tentative', 'Not certain or final'],
  ['Elicit', 'To draw out a response'],
];

export default function VocabularyScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>VOCABULARY</Text>
      <Text style={styles.title}>Your word library.</Text>
      <Text style={styles.subtitle}>Bulk-imported collections become reusable across every practice mode.</Text>

      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={() => router.push('/practice')}><Text style={styles.primaryText}>Create practice</Text></Pressable>
        <View style={styles.secondary}><Text style={styles.secondaryText}>↑ Bulk import</Text></View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}><Text style={styles.sectionTitle}>Recent words</Text><Text style={styles.count}>15,559 imported records</Text></View>
        {words.map(([word, meaning]) => (
          <View style={styles.wordRow} key={word}>
            <View><Text style={styles.word}>{word}</Text><Text style={styles.meaning}>{meaning}</Text></View>
            <Text style={styles.status}>Review</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Collections</Text>
        {['June', 'July', 'August', 'September', 'October'].map((name) => (
          <View style={styles.collection} key={name}><Text style={styles.word}>{name}</Text><Text style={styles.meaning}>Vocabulary collection</Text></View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F6F7FB' },
  content: { padding: 20, paddingTop: 24, paddingBottom: 36, gap: 16 },
  eyebrow: { color: '#5B5CE2', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  title: { color: '#172033', fontSize: 30, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#667085', fontSize: 14, lineHeight: 20, marginTop: 7 },
  actions: { flexDirection: 'row', gap: 10 },
  primary: { backgroundColor: '#5B5CE2', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12 },
  primaryText: { color: '#fff', fontWeight: '900' },
  secondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F0', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12 },
  secondaryText: { color: '#172033', fontWeight: '800' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E9F0', borderRadius: 20, padding: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#172033', fontSize: 18, fontWeight: '900' },
  count: { color: '#667085', fontSize: 11, fontWeight: '700' },
  wordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEF0F5', paddingVertical: 13 },
  word: { color: '#172033', fontSize: 15, fontWeight: '850' },
  meaning: { color: '#667085', fontSize: 12, marginTop: 3 },
  status: { color: '#168A5B', backgroundColor: '#EEF9F3', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99, fontSize: 11, fontWeight: '800' },
  collection: { borderTopWidth: 1, borderTopColor: '#EEF0F5', paddingVertical: 12 },
});
