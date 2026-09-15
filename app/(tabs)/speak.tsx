import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';

type Message = { from: 'ai' | 'me'; text: string };
const prompts = [
  { topic: 'Ordering coffee', ai: "Hi! Let's practice ordering coffee. What would you like?" },
  { topic: 'Meeting someone', ai: "Nice to meet you! Tell me where you're from and what you do." },
  { topic: 'Travel', ai: "You're checking into a hotel. How would you ask for your room?" },
];
function coachReply(text: string) {
  const value = text.trim();
  if (!value) return 'Try saying a complete sentence. For example: Could I have a cappuccino, please?';
  if (value.length < 12) return 'Good start. Try adding one more detail so your sentence sounds more natural.';
  if (!/[.!?]$/.test(value)) return 'Nice sentence. Add a little detail and try saying it once more with a confident voice.';
  return 'Great job. Your sentence is clear. Now try saying the same idea with a little more detail.';
}
export default function SpeakScreen() {
  const [scenario, setScenario] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ from: 'ai', text: prompts[0].ai }]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  useEffect(() => () => { recognitionRef.current?.stop?.(); Speech.stop(); }, []);
  const speak = (text: string) => Speech.speak(text, { language: 'en-US', rate: 0.92 });
  const send = (text = input) => {
    const clean = text.trim(); if (!clean) return;
    const reply = coachReply(clean);
    setMessages((current) => [...current, { from: 'me', text: clean }, { from: 'ai', text: reply }]);
    setInput(''); speak(reply);
  };
  const startListening = () => {
    if (Platform.OS !== 'web') return;
    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setInput('Speech recognition is not supported by this browser. Type your answer below.'); return; }
    const recognition = new SpeechRecognition(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event: any) => { const text = event.results?.[0]?.[0]?.transcript || ''; setListening(false); setInput(text); if (text) send(text); };
    recognition.onerror = () => setListening(false); recognition.onend = () => setListening(false); recognitionRef.current = recognition;
    setListening(true); recognition.start();
  };
  const changeScenario = (next: number) => { setScenario(next); setMessages([{ from: 'ai', text: prompts[next].ai }]); setInput(''); speak(prompts[next].ai); };
  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.eyebrow}>SPEAK WITH AI</Text><Text style={styles.title}>Practice real conversations.</Text>
    <Text style={styles.subtitle}>Speak or type your reply. Lingua gives instant coaching and reads the coach response aloud.</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarios}>{prompts.map((item, i) => <Pressable key={item.topic} onPress={() => changeScenario(i)} style={[styles.scenario, i === scenario && styles.scenarioActive]}><Text style={[styles.scenarioText, i === scenario && styles.scenarioTextActive]}>{item.topic}</Text></Pressable>)}</ScrollView>
    <View style={styles.card}>
      {messages.map((message, i) => <View key={`${message.from}-${i}`} style={[styles.bubble, message.from === 'me' && styles.bubbleMe]}><Text style={message.from === 'me' ? styles.textMe : styles.text}>{message.text}</Text>{message.from === 'ai' ? <Pressable onPress={() => speak(message.text)}><Text style={styles.listenAgain}>🔊 Hear again</Text></Pressable> : null}</View>)}
      <TextInput value={input} onChangeText={setInput} placeholder="Type what you would say…" placeholderTextColor="#98A2B3" multiline style={styles.input} />
      <View style={styles.controls}><Pressable onPress={startListening} style={[styles.mic, listening && styles.micActive]}><Text style={styles.micText}>{listening ? '●' : '🎙'}</Text></Pressable><Pressable onPress={() => send()} style={styles.send}><Text style={styles.sendText}>Send response</Text></Pressable></View>
      <Text style={styles.hint}>{Platform.OS === 'web' ? (listening ? 'Listening… speak now.' : 'Use the microphone for browser speech recognition.') : 'On mobile, type your response for now; voice playback works with the device speaker.'}</Text>
    </View>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flexGrow:1,backgroundColor:'#F6F7FB',padding:20,paddingTop:24,paddingBottom:40},eyebrow:{color:'#5B5CE2',fontSize:12,fontWeight:'900',letterSpacing:1},title:{color:'#172033',fontSize:30,fontWeight:'900',marginTop:5},subtitle:{color:'#667085',fontSize:14,lineHeight:20,marginTop:7,marginBottom:12},scenarios:{gap:8,paddingVertical:4},scenario:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:12,paddingHorizontal:12,paddingVertical:9},scenarioActive:{backgroundColor:'#EEEFFF',borderColor:'#C9CAFF'},scenarioText:{color:'#596174',fontSize:12,fontWeight:'800'},scenarioTextActive:{color:'#5B5CE2'},card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:22,padding:18,marginTop:10,maxWidth:760,width:'100%',alignSelf:'center'},bubble:{backgroundColor:'#F7F7FB',borderRadius:17,padding:14,marginBottom:10,maxWidth:'82%'},bubbleMe:{backgroundColor:'#5B5CE2',alignSelf:'flex-end'},text:{color:'#273047',fontSize:14,lineHeight:20},textMe:{color:'#fff',fontSize:14,lineHeight:20},listenAgain:{color:'#5B5CE2',fontSize:11,fontWeight:'800',marginTop:9},input:{minHeight:78,borderWidth:1,borderColor:'#D9DCE5',borderRadius:14,padding:12,color:'#172033',fontSize:14,textAlignVertical:'top',backgroundColor:'#fff'},controls:{flexDirection:'row',alignItems:'center',gap:10,marginTop:10},mic:{width:52,height:52,borderRadius:26,backgroundColor:'#5B5CE2',alignItems:'center',justifyContent:'center'},micActive:{backgroundColor:'#292C63'},micText:{color:'#fff',fontSize:20},send:{flex:1,backgroundColor:'#5B5CE2',borderRadius:12,padding:14,alignItems:'center'},sendText:{color:'#fff',fontWeight:'900'},hint:{color:'#98A2B3',fontSize:11,lineHeight:17,marginTop:9}});
