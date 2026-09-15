import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Speech from 'expo-speech';
import { supabase } from '../../lib/supabase';

type Message = { from: 'ai' | 'me'; text: string };

type Scenario = {
  topic: string;
  goal: string;
  opening: string;
};

const scenarios: Scenario[] = [
  { topic: 'Ordering coffee', goal: 'Order a drink and food naturally at a café.', opening: "Hi! Welcome to the café. What can I get for you today?" },
  { topic: 'Meeting someone', goal: 'Introduce yourself and keep a friendly conversation going.', opening: "Nice to meet you! Tell me a little about yourself." },
  { topic: 'Travel', goal: 'Check into a hotel and ask useful travel questions.', opening: "Welcome to the hotel. Do you have a reservation with us?" },
  { topic: 'Job interview', goal: 'Answer common interview questions clearly and confidently.', opening: "Thanks for coming in today. Could you tell me about yourself?" },
  { topic: 'Daily life', goal: 'Talk naturally about your routine, plans, and interests.', opening: "Hey! How has your day been going? What have you been up to?" },
];

const FALLBACK_REPLY = 'I can still coach you locally, but the AI service is not connected yet. Try another sentence and I’ll help you improve it.';

function localCoach(text: string) {
  const value = text.trim();
  if (!value) return 'Try saying a complete sentence. For example: Could I have a cappuccino, please?';
  if (value.length < 12) return 'Good start. Add one more detail so your sentence sounds more natural.';
  if (!/[.!?]$/.test(value)) return 'Nice. Your idea is clear. Try saying it again with a little more detail or add a question to keep the conversation going.';
  return 'Good job. Your sentence is clear. Now try extending the idea with one more detail.';
}

async function getAiReply(scenario: Scenario, history: Message[], userText: string) {
  const { data, error } = await supabase.functions.invoke('lingua-speak', {
    body: { scenario, history: history.slice(-10), userText },
  });
  if (error) throw error;
  const reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
  if (!reply) throw new Error('The AI service returned an empty reply.');
  return reply;
}

export default function SpeakScreen() {
  const [scenario, setScenario] = useState(0);
  const [messages, setMessages] = useState<Message[]>([{ from: 'ai', text: scenarios[0].opening }]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [aiConnected, setAiConnected] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => () => { recognitionRef.current?.stop?.(); Speech.stop(); }, []);

  const speak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 0.92, pitch: 1.0 });
  };

  const send = async (text = input) => {
    const clean = text.trim();
    if (!clean || thinking) return;

    const previous = messages;
    setInput('');
    setMessages((current) => [...current, { from: 'me', text: clean }]);
    setThinking(true);

    try {
      const reply = await getAiReply(scenarios[scenario], previous, clean);
      setAiConnected(true);
      setMessages((current) => [...current, { from: 'ai', text: reply }]);
      speak(reply);
    } catch {
      setAiConnected(false);
      const reply = localCoach(clean) || FALLBACK_REPLY;
      setMessages((current) => [...current, { from: 'ai', text: reply }]);
      speak(reply);
    } finally {
      setThinking(false);
    }
  };

  const startListening = () => {
    if (Platform.OS !== 'web') {
      setInput('Voice input on mobile needs the speech-to-text service. Type your answer for now.');
      return;
    }

    const SpeechRecognition = (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setInput('Speech recognition is not supported by this browser. Type your answer below.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const text = event.results?.[0]?.[0]?.transcript || '';
      setListening(false);
      if (text) send(text);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  const changeScenario = (next: number) => {
    if (thinking) return;
    setScenario(next);
    setMessages([{ from: 'ai', text: scenarios[next].opening }]);
    setInput('');
    setAiConnected(true);
    speak(scenarios[next].opening);
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.eyebrow}>AI SPEAKING COACH</Text>
      <View style={styles.titleRow}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Practice real conversations.</Text>
          <Text style={styles.subtitle}>The AI coach follows the conversation, asks natural follow-up questions, and gives short English corrections when useful.</Text>
        </View>
        <View style={[styles.status, aiConnected ? styles.statusGood : styles.statusFallback]}>
          <View style={[styles.statusDot, aiConnected ? styles.statusDotGood : styles.statusDotFallback]} />
          <Text style={styles.statusText}>{aiConnected ? 'AI online' : 'Offline coaching'}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scenarios}>
        {scenarios.map((item, i) => (
          <Pressable key={item.topic} onPress={() => changeScenario(i)} style={[styles.scenario, i === scenario && styles.scenarioActive]}>
            <Text style={[styles.scenarioText, i === scenario && styles.scenarioTextActive]}>{item.topic}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.goal}><Text style={styles.goalLabel}>TODAY'S CONVERSATION GOAL</Text><Text style={styles.goalText}>{scenarios[scenario].goal}</Text></View>

      <View style={styles.card}>
        {messages.map((message, i) => (
          <View key={`${message.from}-${i}`} style={[styles.bubble, message.from === 'me' && styles.bubbleMe]}>
            <Text style={message.from === 'me' ? styles.textMe : styles.text}>{message.text}</Text>
            {message.from === 'ai' ? <Pressable onPress={() => speak(message.text)}><Text style={styles.listenAgain}>🔊 Hear again</Text></Pressable> : null}
          </View>
        ))}
        {thinking ? <View style={styles.thinking}><View style={styles.thinkingDot} /><View style={styles.thinkingDot} /><View style={styles.thinkingDot} /><Text style={styles.thinkingText}>AI is thinking…</Text></View> : null}

        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type what you would say…"
          placeholderTextColor="#98A2B3"
          multiline
          editable={!thinking}
          style={styles.input}
        />

        <View style={styles.controls}>
          <Pressable disabled={thinking} onPress={startListening} style={[styles.mic, listening && styles.micActive, thinking && styles.disabled]}>
            <Text style={styles.micText}>{listening ? '●' : '🎙'}</Text>
          </Pressable>
          <Pressable disabled={thinking || !input.trim()} onPress={() => send()} style={[styles.send, (thinking || !input.trim()) && styles.disabled]}>
            <Text style={styles.sendText}>{thinking ? 'Thinking…' : 'Send response'}</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>{Platform.OS === 'web' ? (listening ? 'Listening… speak naturally.' : 'Microphone uses your browser speech recognition.') : 'Voice playback works on mobile. Voice input will use the AI speech service once connected.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen:{flexGrow:1,backgroundColor:'#F6F7FB',padding:20,paddingTop:24,paddingBottom:40},
  eyebrow:{color:'#5B5CE2',fontSize:12,fontWeight:'900',letterSpacing:1},
  titleRow:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between',gap:12},
  titleWrap:{flex:1},
  title:{color:'#172033',fontSize:30,fontWeight:'900',marginTop:5},
  subtitle:{color:'#667085',fontSize:14,lineHeight:20,marginTop:7,marginBottom:12},
  status:{flexDirection:'row',alignItems:'center',gap:6,borderRadius:10,paddingHorizontal:9,paddingVertical:7,marginTop:8},
  statusGood:{backgroundColor:'#ECFDF3'},statusFallback:{backgroundColor:'#FFF4E5'},
  statusDot:{width:7,height:7,borderRadius:4},statusDotGood:{backgroundColor:'#12B76A'},statusDotFallback:{backgroundColor:'#F79009'},
  statusText:{fontSize:11,fontWeight:'800',color:'#596174'},
  scenarios:{gap:8,paddingVertical:4},
  scenario:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:12,paddingHorizontal:12,paddingVertical:9},
  scenarioActive:{backgroundColor:'#EEEFFF',borderColor:'#C9CAFF'},scenarioText:{color:'#596174',fontSize:12,fontWeight:'800'},scenarioTextActive:{color:'#5B5CE2'},
  goal:{backgroundColor:'#292C63',borderRadius:16,padding:15,marginTop:10},goalLabel:{color:'#BFC2FF',fontSize:10,fontWeight:'900',letterSpacing:1},goalText:{color:'#fff',fontSize:14,fontWeight:'700',lineHeight:20,marginTop:5},
  card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:22,padding:18,marginTop:10,maxWidth:760,width:'100%',alignSelf:'center'},
  bubble:{backgroundColor:'#F7F7FB',borderRadius:17,padding:14,marginBottom:10,maxWidth:'82%'},bubbleMe:{backgroundColor:'#5B5CE2',alignSelf:'flex-end'},
  text:{color:'#273047',fontSize:14,lineHeight:20},textMe:{color:'#fff',fontSize:14,lineHeight:20},listenAgain:{color:'#5B5CE2',fontSize:11,fontWeight:'800',marginTop:9},
  thinking:{flexDirection:'row',alignItems:'center',gap:5,marginBottom:10},thinkingDot:{width:6,height:6,borderRadius:3,backgroundColor:'#8A8F9F'},thinkingText:{color:'#98A2B3',fontSize:12,marginLeft:3},
  input:{minHeight:78,borderWidth:1,borderColor:'#D9DCE5',borderRadius:14,padding:12,color:'#172033',fontSize:14,textAlignVertical:'top',backgroundColor:'#fff'},
  controls:{flexDirection:'row',alignItems:'center',gap:10,marginTop:10},mic:{width:52,height:52,borderRadius:26,backgroundColor:'#5B5CE2',alignItems:'center',justifyContent:'center'},micActive:{backgroundColor:'#292C63'},micText:{color:'#fff',fontSize:20},
  send:{flex:1,backgroundColor:'#5B5CE2',borderRadius:12,padding:14,alignItems:'center'},sendText:{color:'#fff',fontWeight:'900'},disabled:{opacity:0.45},hint:{color:'#98A2B3',fontSize:11,lineHeight:17,marginTop:9}
});
