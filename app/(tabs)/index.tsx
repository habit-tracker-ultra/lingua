import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const colors = { bg: '#F6F7FB', ink: '#172033', muted: '#667085', primary: '#5B5CE2', soft: '#EEefff', white: '#FFFFFF', line: '#E7E9F0', green: '#16A66A' };

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>GOOD MORNING</Text>
          <Text style={styles.title}>Build your English, one day at a time.</Text>
          <Text style={styles.subtitle}>Words, grammar, speaking and everyday English in one place.</Text>
        </View>
        <View style={styles.avatar}><Text style={styles.avatarText}>L</Text></View>
      </View>

      <View style={styles.statsGrid}>
        {[
          ['12', 'Day streak', '+2 this week'],
          ['248', 'Words learned', '+18 this week'],
          ['76%', 'Speaking', '+8% this month'],
          ['72%', 'Daily goal', '18 / 25 min'],
        ].map(([value, label, delta]) => (
          <Card key={label} style={styles.stat}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.delta}>{delta}</Text>
          </Card>
        ))}
      </View>

      <Pressable style={styles.hero} onPress={() => router.push('/speak')}>
        <Text style={styles.heroEyebrow}>AI SPEAKING COACH</Text>
        <Text style={styles.heroTitle}>Practice real conversations without pressure.</Text>
        <Text style={styles.heroText}>Talk naturally, get gentle corrections and build confidence.</Text>
        <View style={styles.heroButton}><Text style={styles.heroButtonText}>Start speaking →</Text></View>
      </Pressable>

      <Card>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Today's path</Text><Text style={styles.link}>View all</Text></View>
        {[
          ['1', '10 new words', 'Vocabulary · 7 min'],
          ['2', 'Present simple', 'Grammar · 8 min'],
          ['3', 'Daily conversation', 'Speaking · 10 min'],
        ].map(([n, title, meta]) => (
          <View style={styles.lesson} key={n}>
            <View style={styles.lessonCircle}><Text style={styles.lessonNumber}>{n}</Text></View>
            <View><Text style={styles.lessonTitle}>{title}</Text><Text style={styles.meta}>{meta}</Text></View>
          </View>
        ))}
      </Card>

      <Card>
        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Continue learning</Text><Text style={styles.link}>Open</Text></View>
        <Text style={styles.lessonTitle}>Travel essentials</Text>
        <Text style={styles.meta}>24 words · 68% complete</Text>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: '68%' }]} /></View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 24, paddingBottom: 36, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 30, lineHeight: 35, fontWeight: '900', letterSpacing: -0.7, marginTop: 5, maxWidth: 560 },
  subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7, maxWidth: 600 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '900' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { flexGrow: 1, flexBasis: '47%', minWidth: 150 },
  card: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 18 },
  statLabel: { color: colors.muted, fontSize: 12 },
  statValue: { color: colors.ink, fontSize: 27, fontWeight: '900', marginTop: 6 },
  delta: { color: colors.green, fontSize: 12, fontWeight: '700', marginTop: 3 },
  hero: { backgroundColor: '#292C63', borderRadius: 22, padding: 22 },
  heroEyebrow: { color: '#BFC2FF', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 25, lineHeight: 30, fontWeight: '900', marginTop: 7, maxWidth: 520 },
  heroText: { color: '#D8D9F4', fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 560 },
  heroButton: { alignSelf: 'flex-start', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11, marginTop: 14 },
  heroButtonText: { color: '#292C63', fontWeight: '900' },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: colors.ink, fontSize: 18, fontWeight: '900' },
  link: { color: colors.primary, fontWeight: '800' },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9 },
  lessonCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  lessonNumber: { color: colors.primary, fontWeight: '900' },
  lessonTitle: { color: colors.ink, fontSize: 15, fontWeight: '800' },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  progressTrack: { height: 8, backgroundColor: '#ECEEF5', borderRadius: 8, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 8 },
});
