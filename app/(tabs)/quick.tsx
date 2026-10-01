import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { getPracticeStats, PracticeStats } from '../../lib/progressStore';
import { useTheme } from '../../lib/theme';

type QuickCardProps = {
  icon: string;
  label: string;
  title: string;
  description: string;
  route: string;
  theme: any;
};

function QuickCard({ icon, label, title, description, route, theme }: QuickCardProps) {
  return (
    <Pressable
      onPress={() => router.push(route as never)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.line },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: theme.soft }]}>
        <Text style={[styles.icon, { color: theme.primary }]}>{icon}</Text>
      </View>
      <Text style={[styles.tag, { color: theme.primary, backgroundColor: theme.soft }]}>{label}</Text>
      <Text style={[styles.cardTitle, { color: theme.ink }]}>{title}</Text>
      <Text style={[styles.cardDescription, { color: theme.muted }]}>{description}</Text>
      <Text style={[styles.open, { color: theme.primary }]}>Open {title} →</Text>
    </Pressable>
  );
}

export default function QuickScreen() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<PracticeStats>(getPracticeStats());
  const [vocabCount, setVocabCount] = useState<number | null>(null);
  const [flashcardCount, setFlashcardCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setStats(getPracticeStats());
    const [{ count: vocab }, { count: flashcards }] = await Promise.all([
      supabase.from('vocabulary').select('id', { count: 'exact', head: true }),
      supabase.from('flashcard_history').select('id', { count: 'exact', head: true }),
    ]);
    setVocabCount(vocab ?? 0);
    setFlashcardCount(flashcards ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const id = setInterval(() => setStats(getPracticeStats()), 1000);
    return () => clearInterval(id);
  }, [load]);

  const accuracy = stats.questions ? Math.round((stats.correct / stats.questions) * 100) : 0;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator color={theme.primary} />
        <Text style={[styles.muted, { color: theme.muted }]}>Loading Quick…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.bg }}
      contentContainerStyle={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: theme.primary }]}>QUICK</Text>
          <Text style={[styles.title, { color: theme.ink }]}>Everything you need, one tap away.</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>
            A single place to jump into every existing learning tool without changing its data or behaviour.
          </Text>
        </View>
        <View style={[styles.quickMark, { backgroundColor: theme.primary }]}>
          <Text style={styles.quickMarkText}>⚡</Text>
        </View>
      </View>

      <View style={[styles.snapshot, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <View style={styles.snapshotHeader}>
          <View>
            <Text style={[styles.snapshotTitle, { color: theme.ink }]}>Your snapshot</Text>
            <Text style={[styles.mutedSmall, { color: theme.muted }]}>Live data from the existing app</Text>
          </View>
          <Text style={[styles.liveTag, { color: theme.primary, backgroundColor: theme.soft }]}>LIVE</Text>
        </View>

        <View style={styles.statsGrid}>
          <Stat label="Vocabulary" value={vocabCount === null ? '—' : vocabCount.toLocaleString()} theme={theme} />
          <Stat label="Practice accuracy" value={`${accuracy}%`} theme={theme} />
          <Stat label="Practice sessions" value={String(stats.sessions)} theme={theme} />
          <Stat label="Flashcard reviews" value={flashcardCount === null ? '—' : flashcardCount.toLocaleString()} theme={theme} />
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.ink }]}>All learning tools</Text>
      <View style={styles.grid}>
        <QuickCard icon="⌂" label="LEARN" title="Home" description="Your main learning dashboard and current learning overview." route="/" theme={theme} />
        <QuickCard icon="Aa" label="WORDS" title="Vocabulary" description="Browse, search and work with the full vocabulary library." route="/vocabulary" theme={theme} />
        <QuickCard icon="▣" label="REVIEW" title="Flashcards" description="Review vocabulary with the existing flashcard flow and history." route="/flashcards" theme={theme} />
        <QuickCard icon="✓" label="PRACTICE" title="Practice" description="Use the existing practice modes and keep practice statistics intact." route="/practice" theme={theme} />
        <QuickCard icon="◉" label="SPEAK" title="Speak" description="Open the existing AI speaking and pronunciation experience." route="/speak" theme={theme} />
        <QuickCard icon="↗" label="PROGRESS" title="Progress" description="See the same vocabulary and practice progress already tracked." route="/progress" theme={theme} />
        <QuickCard icon="⇧" label="DATA" title="Bulk Import" description="Import vocabulary using the existing CSV workflow without changing its rules." route="/import" theme={theme} />
        <QuickCard icon="⚙" label="ACCOUNT" title="Profile" description="Manage the existing account and appearance settings." route="/profile" theme={theme} />
      </View>

      <View style={[styles.continueCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, { color: theme.ink, marginTop: 0 }]}>Continue learning</Text>
          <Text style={[styles.continueText, { color: theme.muted }]}>
            Jump straight back into the practice flow. Your existing progress and vocabulary data stay unchanged.
          </Text>
        </View>
        <Pressable onPress={() => router.push('/practice' as never)} style={[styles.primaryButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.primaryButtonText}>Start practice →</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: any }) {
  return (
    <View style={[styles.stat, { backgroundColor: theme.surfaceAlt, borderColor: theme.line }]}>
      <Text style={[styles.statValue, { color: theme.ink }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, padding: 20, paddingTop: 24, paddingBottom: 40, maxWidth: 1100, width: '100%', alignSelf: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 20 },
  eyebrow: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  title: { fontSize: 30, fontWeight: '900', lineHeight: 35, marginTop: 5 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 8, maxWidth: 760 },
  quickMark: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  quickMarkText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  snapshot: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 22 },
  snapshotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  snapshotTitle: { fontSize: 18, fontWeight: '900' },
  mutedSmall: { fontSize: 11, marginTop: 3 },
  liveTag: { fontSize: 9, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { flexGrow: 1, flexBasis: 150, minWidth: 135, borderWidth: 1, borderRadius: 15, padding: 14 },
  statValue: { fontSize: 25, fontWeight: '900' },
  statLabel: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { flexGrow: 1, flexBasis: 250, minWidth: 230, borderWidth: 1, borderRadius: 20, padding: 18, minHeight: 195 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  icon: { fontSize: 18, fontWeight: '900' },
  tag: { alignSelf: 'flex-start', fontSize: 9, fontWeight: '900', letterSpacing: 0.6, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7, overflow: 'hidden' },
  cardTitle: { fontSize: 18, fontWeight: '900', marginTop: 9 },
  cardDescription: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  open: { fontSize: 12, fontWeight: '900', marginTop: 'auto' as any, paddingTop: 15 },
  continueCard: { borderWidth: 1, borderRadius: 20, padding: 18, marginTop: 22, flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  continueText: { fontSize: 12, lineHeight: 18, maxWidth: 650 },
  primaryButton: { borderRadius: 12, paddingHorizontal: 15, paddingVertical: 11 },
  primaryButtonText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  muted: { fontSize: 12, marginTop: 8 },
});
