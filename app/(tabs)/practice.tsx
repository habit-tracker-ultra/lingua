import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import { recordPractice } from '../../lib/progressStore';

type Word = { id: string; word: string; meaning: string | null; definition: string | null; example_sentence: string | null };
type Question = Word & { options: string[]; correctIndex: number };

const meaningOf = (w: Word) => w.meaning || w.definition || 'Meaning unavailable';
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5);
const makeQuestion = (word: Word, pool: Word[]): Question => {
  const correct = meaningOf(word);
  const wrong = shuffle(pool.filter((x) => x.id !== word.id && meaningOf(x) !== correct)).slice(0, 3).map(meaningOf);
  const options = shuffle([correct, ...wrong]);
  return { ...word, options, correctIndex: options.indexOf(correct) };
};

export default function PracticeScreen() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [timer, setTimer] = useState(10);
  const [remaining, setRemaining] = useState(10);
  const [correct, setCorrect] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null); setFinished(false); setSelected(null); setIndex(0); setCorrect(0);
    const { data, error: queryError } = await supabase.from('vocabulary').select('id, word, meaning, definition, example_sentence').limit(160);
    if (queryError || !data?.length) { setError(queryError?.message || 'No vocabulary found.'); setLoading(false); return; }
    const pool = data.filter((x) => x.word?.trim());
    setQuestions(shuffle(pool).slice(0, 20).map((x) => makeQuestion(x, pool)));
    setRemaining(timer); setLoading(false);
  }, [timer]);

  useEffect(() => { load(); }, [load]);
  const current = questions[index];

  useEffect(() => {
    if (!current || selected !== null || timer === 0) return;
    setRemaining(timer);
    const id = setInterval(() => setRemaining((n) => {
      if (n <= 1) { clearInterval(id); setSelected(-1); return 0; }
      return n - 1;
    }), 1000);
    return () => clearInterval(id);
  }, [index, current, selected, timer]);

  const choose = (n: number) => {
    if (selected !== null) return;
    setSelected(n);
    if (n === current.correctIndex) setCorrect((x) => x + 1);
  };

  const next = () => {
    if (index === questions.length - 1) {
      const finalCorrect = correct + (selected === current.correctIndex ? 0 : 0);
      recordPractice(finalCorrect, questions.length);
      setFinished(true); return;
    }
    setIndex((x) => x + 1); setSelected(null); setRemaining(timer);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#5B5CE2" /><Text style={styles.muted}>Loading practice…</Text></View>;
  if (error) return <View style={styles.center}><Text style={styles.title}>Practice unavailable</Text><Text style={styles.muted}>{error}</Text><Pressable style={styles.primary} onPress={load}><Text style={styles.primaryText}>Try again</Text></Pressable></View>;
  if (finished) {
    const pct = questions.length ? Math.round((correct / questions.length) * 100) : 0;
    return <View style={styles.center}><Text style={styles.eyebrow}>SESSION COMPLETE</Text><Text style={styles.title}>Great job.</Text><Text style={styles.score}>{pct}%</Text><Text style={styles.muted}>{correct} correct out of {questions.length}</Text><Pressable style={styles.primary} onPress={load}><Text style={styles.primaryText}>Practice again</Text></Pressable></View>;
  }

  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.eyebrow}>PRACTICE</Text>
    <View style={styles.heading}><View><Text style={styles.title}>Build your recall.</Text><Text style={styles.muted}>Question {index + 1} of {questions.length}</Text></View><Text style={styles.timer}>{timer === 0 ? '∞' : `${remaining}s`}</Text></View>
    <View style={styles.card}>
      <Text style={styles.prompt}>What does <Text style={styles.bold}>{current.word}</Text> mean?</Text>
      {current.options.map((option, n) => <Pressable key={option} onPress={() => choose(n)} style={[styles.option, selected !== null && n === current.correctIndex && styles.correct, selected === n && n !== current.correctIndex && styles.wrong]}><Text style={styles.letter}>{String.fromCharCode(65 + n)}</Text><Text style={styles.optionText}>{option}</Text></Pressable>)}
      {selected !== null && <Text style={[styles.status, selected !== current.correctIndex && styles.statusWrong]}>{selected === -1 ? `Time's up · ${current.options[current.correctIndex]}` : selected === current.correctIndex ? '✓ Correct' : `✕ Correct answer: ${current.options[current.correctIndex]}`}</Text>}
      {current.example_sentence ? <Text style={styles.example}>Example: {current.example_sentence}</Text> : null}
      <Pressable disabled={selected === null} onPress={next} style={[styles.next, selected === null && styles.disabled]}><Text style={styles.primaryText}>{index === questions.length - 1 ? 'Finish session' : 'Next question →'}</Text></Pressable>
    </View>
    <View style={styles.settings}><Text style={styles.settingsTitle}>Question timer</Text><View style={styles.row}>{[0,5,10,15,30].map((n) => <Pressable key={n} onPress={() => { setTimer(n); setRemaining(n); }} style={[styles.chip, timer === n && styles.activeChip]}><Text style={styles.chipText}>{n === 0 ? '∞' : `${n}s`}</Text></Pressable>)}</View></View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen:{flexGrow:1,backgroundColor:'#F6F7FB',padding:20,paddingTop:24,paddingBottom:40},center:{flex:1,backgroundColor:'#F6F7FB',alignItems:'center',justifyContent:'center',padding:24,gap:10},eyebrow:{color:'#5B5CE2',fontSize:12,fontWeight:'900',letterSpacing:1},heading:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16},title:{color:'#172033',fontSize:30,fontWeight:'900',marginTop:5},muted:{color:'#667085',fontSize:13,lineHeight:19},timer:{color:'#5B5CE2',fontWeight:'900',fontSize:16,marginTop:10},card:{backgroundColor:'#fff',borderRadius:22,borderWidth:1,borderColor:'#E7E9F0',padding:20,maxWidth:760,width:'100%',alignSelf:'center'},prompt:{color:'#172033',fontSize:25,lineHeight:32,fontWeight:'800',marginBottom:20},bold:{color:'#5B5CE2'},option:{flexDirection:'row',alignItems:'center',gap:12,borderWidth:1,borderColor:'#E7E9F0',borderRadius:14,padding:13,marginBottom:9},correct:{borderColor:'#54B98B',backgroundColor:'#EFFAF5'},wrong:{borderColor:'#E88B8B',backgroundColor:'#FFF5F5'},letter:{width:30,height:30,borderRadius:15,backgroundColor:'#F0F1F6',textAlign:'center',textAlignVertical:'center',paddingTop:6,color:'#596174',fontWeight:'900'},optionText:{color:'#273047',flex:1,fontSize:14,fontWeight:'600'},status:{color:'#168A5B',fontWeight:'900',marginTop:8},statusWrong:{color:'#C0392B'},example:{color:'#667085',backgroundColor:'#F8F8FC',padding:12,borderRadius:12,marginTop:12,lineHeight:19},next:{backgroundColor:'#5B5CE2',borderRadius:12,padding:13,alignItems:'center',marginTop:16},disabled:{opacity:0.45},primary:{backgroundColor:'#5B5CE2',paddingHorizontal:16,paddingVertical:12,borderRadius:12,marginTop:8},primaryText:{color:'#fff',fontWeight:'900'},score:{color:'#5B5CE2',fontSize:54,fontWeight:'900',marginTop:12},settings:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:18,padding:16,marginTop:14,maxWidth:760,width:'100%',alignSelf:'center'},settingsTitle:{color:'#172033',fontWeight:'900'},row:{flexDirection:'row',gap:8,flexWrap:'wrap',marginTop:10},chip:{backgroundColor:'#F0F1F6',paddingHorizontal:12,paddingVertical:8,borderRadius:10},activeChip:{backgroundColor:'#EEEFFF',borderWidth:1,borderColor:'#C9CAFF'},chipText:{color:'#273047',fontWeight:'800'}
});
