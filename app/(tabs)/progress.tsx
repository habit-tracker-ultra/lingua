import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getPracticeStats, resetPracticeStats, PracticeStats } from '../../lib/progressStore';
import { supabase } from '../../lib/supabase';

export default function ProgressScreen() {
  const [stats, setStats] = useState<PracticeStats>(getPracticeStats());
  const [vocabCount, setVocabCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setStats(getPracticeStats());
    const { count } = await supabase.from('vocabulary').select('id', { count: 'exact', head: true });
    setVocabCount(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); const id = setInterval(() => setStats(getPracticeStats()), 1000); return () => clearInterval(id); }, [refresh]);

  const accuracy = stats.questions ? Math.round((stats.correct / stats.questions) * 100) : 0;
  const questions = stats.questions;
  const skills = [
    ['Vocabulary library', vocabCount === null ? '—' : `${vocabCount.toLocaleString()} records`],
    ['Practice accuracy', `${accuracy}%`],
    ['Practice questions', `${questions}`],
    ['Practice sessions', `${stats.sessions}`],
  ];

  if (loading) return <View style={styles.center}><ActivityIndicator color="#5B5CE2" /><Text style={styles.muted}>Loading progress…</Text></View>;

  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.eyebrow}>PROGRESS</Text>
    <Text style={styles.title}>See how far you've come.</Text>
    <Text style={styles.subtitle}>This dashboard updates from your completed practice sessions and the live vocabulary library.</Text>

    <View style={styles.statsRow}>
      <View style={styles.card}><Text style={styles.value}>{stats.sessions}</Text><Text style={styles.label}>Sessions</Text></View>
      <View style={styles.card}><Text style={styles.value}>{stats.correct}</Text><Text style={styles.label}>Correct</Text></View>
      <View style={styles.card}><Text style={styles.value}>{accuracy}%</Text><Text style={styles.label}>Accuracy</Text></View>
    </View>

    <View style={styles.wide}>
      <Text style={styles.section}>Your learning data</Text>
      {skills.map(([name, value]) => <View key={name} style={styles.item}><Text style={styles.itemName}>{name}</Text><Text style={styles.itemValue}>{value}</Text></View>)}
      {stats.lastSessionAt ? <Text style={styles.muted}>Last practice: {new Date(stats.lastSessionAt).toLocaleString()}</Text> : <Text style={styles.muted}>Complete a practice session to start building your progress.</Text>}
    </View>

    <Pressable style={styles.secondary} onPress={() => { resetPracticeStats(); setStats(getPracticeStats()); }}><Text style={styles.secondaryText}>Reset local practice stats</Text></Pressable>
  </ScrollView>;
}

const styles=StyleSheet.create({screen:{flexGrow:1,backgroundColor:'#F6F7FB',padding:20,paddingTop:24,paddingBottom:40},center:{flex:1,backgroundColor:'#F6F7FB',alignItems:'center',justifyContent:'center',gap:10},eyebrow:{color:'#5B5CE2',fontSize:12,fontWeight:'900',letterSpacing:1},title:{color:'#172033',fontSize:30,fontWeight:'900',marginTop:5},subtitle:{color:'#667085',fontSize:14,lineHeight:20,marginTop:7,marginBottom:16},statsRow:{flexDirection:'row',gap:10,flexWrap:'wrap'},card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:20,padding:18,flex:1,minWidth:100},value:{color:'#5B5CE2',fontSize:30,fontWeight:'900'},label:{color:'#596174',fontSize:12,fontWeight:'700'},wide:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:20,padding:18,marginTop:16},section:{color:'#172033',fontSize:18,fontWeight:'900',marginBottom:12},item:{flexDirection:'row',justifyContent:'space-between',paddingVertical:13,borderBottomWidth:1,borderBottomColor:'#F0F1F6'},itemName:{color:'#596174',fontWeight:'700'},itemValue:{color:'#172033',fontWeight:'900'},muted:{color:'#667085',fontSize:12,lineHeight:18,marginTop:12},secondary:{alignSelf:'flex-start',marginTop:14,paddingHorizontal:13,paddingVertical:10,borderRadius:10,borderWidth:1,borderColor:'#D9DCE5',backgroundColor:'#fff'},secondaryText:{color:'#667085',fontWeight:'800',fontSize:12}});
