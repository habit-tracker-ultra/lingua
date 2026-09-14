import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SpeakScreen() {
  const [listening, setListening] = useState(false);
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>SPEAK WITH AI</Text>
      <Text style={styles.title}>Your private conversation partner.</Text>
      <Text style={styles.subtitle}>Practice real situations with gentle feedback. Voice and AI services will be connected in the production phase.</Text>
      <View style={styles.card}>
        <View style={styles.bubble}><Text style={styles.label}>AI Coach</Text><Text style={styles.text}>Hi! Let's practice ordering coffee. What would you like?</Text></View>
        <View style={styles.bubbleMe}><Text style={styles.textMe}>I'd like a cappuccino and a sandwich, please.</Text></View>
        <View style={styles.bubble}><Text style={styles.label}>AI Coach</Text><Text style={styles.text}>Great. Try adding “Could I also have…?” to sound a little more natural.</Text></View>
        <Pressable onPress={() => setListening(!listening)} style={[styles.mic, listening && styles.micActive]}><Text style={styles.micText}>●</Text></Pressable>
        <Text style={styles.listen}>{listening ? 'Listening… speak now' : 'Tap to speak'}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#F6F7FB',padding:20,paddingTop:24},
  eyebrow:{color:'#5B5CE2',fontSize:12,fontWeight:'900',letterSpacing:1},
  title:{color:'#172033',fontSize:30,fontWeight:'900',marginTop:5},
  subtitle:{color:'#667085',fontSize:14,lineHeight:20,marginTop:7,marginBottom:16},
  card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:22,padding:20,maxWidth:760,width:'100%',alignSelf:'center'},
  bubble:{backgroundColor:'#F7F7FB',borderRadius:17,padding:14,marginBottom:10,maxWidth:'78%'},
  bubbleMe:{backgroundColor:'#5B5CE2',borderRadius:17,padding:14,marginBottom:10,maxWidth:'78%',alignSelf:'flex-end'},
  label:{color:'#5B5CE2',fontWeight:'900',fontSize:12,marginBottom:4},
  text:{color:'#273047',fontSize:14,lineHeight:20},textMe:{color:'#fff',fontSize:14,lineHeight:20},
  mic:{width:72,height:72,borderRadius:36,backgroundColor:'#5B5CE2',alignItems:'center',justifyContent:'center',alignSelf:'center',marginTop:22},
  micActive:{backgroundColor:'#292C63'},micText:{color:'#fff',fontSize:25},listen:{textAlign:'center',color:'#667085',fontSize:12,marginTop:9}
});
