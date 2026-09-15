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
        <Text style={[styles.cardTitle, { color: theme.ink }]}>So, who made this?</Text>
        <Text style={[styles.cardText, { color: theme.muted }]}>Meet Rajat — a graphic designer and full-stack developer who decided that learning English should not require a fancy classroom, an expensive course, or a wallet that starts crying before the first lesson.</Text>
        <Text style={[styles.cardText, { color: theme.muted }]}>Lingua. was designed with one simple idea: useful English learning should be accessible to poor and financially limited people too. Instead of making education look like a luxury product, the goal is to make practice feel simple, friendly, practical, and available to anyone who wants to improve.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.cardTitle, { color: theme.ink }]}>Why Lingua.?</Text>
        <Text style={[styles.cardText, { color: theme.muted }]}>Because apparently learning English became a serious business. So here comes Lingua. — trying to make vocabulary, practice, speaking, grammar, phrases, and everyday English less intimidating and more useful.</Text>
        <Text style={[styles.cardText, { color: theme.muted }]}>The idea is to give learners practical tools they can actually use in daily life, without unnecessary complexity. Learn a word, practice it, speak it, make mistakes, laugh at the mistakes, and try again. That is the plan.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.cardTitle, { color: theme.ink }]}>Skills</Text>
        <Text style={[styles.skill, { color: theme.ink }]}>🎨 Expert Graphic Designer</Text>
        <Text style={[styles.skill, { color: theme.ink }]}>💻 Full-Stack Developer</Text>
        <Text style={[styles.skill, { color: theme.ink }]}>🧠 Product & UI/UX Builder</Text>
        <Text style={[styles.skill, { color: theme.ink }]}>⚙️ App & Web Development</Text>
        <Text style={[styles.skill, { color: theme.ink }]}>🚀 Turning ideas into working products</Text>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <Text style={[styles.cardTitle, { color: theme.ink }]}>The serious part 😄</Text>
        <Text style={[styles.cardText, { color: theme.muted }]}>Yes, the tone here is intentionally a little playful. If a developer cannot make fun of his own creation, what are we even doing? Behind the jokes is a serious goal: build something useful for people who deserve access to better learning tools, regardless of how much money they have.</Text>
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
  card: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 10 },
  cardTitle: { fontSize: 18, fontWeight: '900' },
  cardText: { fontSize: 14, lineHeight: 22 },
  skill: { fontSize: 14, lineHeight: 22, fontWeight: '700' },
});
