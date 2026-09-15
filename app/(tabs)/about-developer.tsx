import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../lib/theme';

export default function AboutDeveloper() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.eyebrow, { color: theme.primary }]}>LINGUA.</Text>
      <Text style={[styles.title, { color: theme.ink }]}>About Developer</Text>
      <Text style={[styles.intro, { color: theme.muted }]}>The person behind Lingua.</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.cardTitle, { color: theme.ink }]}>Developer profile</Text>
        <Text style={[styles.cardText, { color: theme.muted }]}>Developer information, story, vision, and background will be added here soon.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.cardTitle, { color: theme.ink }]}>About Lingua.</Text>
        <Text style={[styles.cardText, { color: theme.muted }]}>Lingua. is an English-learning app built around vocabulary, practice, speaking, grammar, and steady progress.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 24, paddingTop: 30, paddingBottom: 50, gap: 14, maxWidth: 760 },
  eyebrow: { fontSize: 12, fontWeight: '900', letterSpacing: 1.2 },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '900', letterSpacing: -0.7 },
  intro: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 8 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  cardText: { fontSize: 14, lineHeight: 22 },
});
