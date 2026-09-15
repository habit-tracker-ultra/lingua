import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true); setMessage(null); setError(null);
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password });
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    if (mode === 'signup' && !result.data.session) {
      setMessage('Account created. Check your email to confirm your account, then sign in.');
      setMode('signin');
      return;
    }
    router.replace('/');
  };

  const guest = async () => {
    setBusy(true); setError(null);
    const { error: guestError } = await supabase.auth.signInAnonymously();
    setBusy(false);
    if (guestError) { setError(guestError.message); return; }
    router.replace('/');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>L</Text></View>
        <Text style={styles.brand}>Lingua<Text style={styles.dot}>.</Text></Text>
        <Text style={styles.title}>{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</Text>
        <Text style={styles.subtitle}>Save your learning progress, vocabulary and practice history across devices.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#98A2B3" autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} placeholder="At least 6 characters" placeholderTextColor="#98A2B3" autoCapitalize="none" secureTextEntry style={styles.input} />

        {error ? <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View> : null}
        {message ? <View style={styles.message}><Text style={styles.messageText}>{message}</Text></View> : null}

        <Pressable disabled={busy || !email.trim() || password.length < 6} onPress={submit} style={[styles.primary, (busy || !email.trim() || password.length < 6) && styles.disabled]}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>{mode === 'signin' ? 'Sign in' : 'Create account'}</Text>}
        </Pressable>

        <Pressable disabled={busy} onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setMessage(null); }} style={styles.switchButton}>
          <Text style={styles.switchText}>{mode === 'signin' ? 'New to Lingua? Create an account' : 'Already have an account? Sign in'}</Text>
        </Pressable>

        <View style={styles.divider}><View style={styles.line} /><Text style={styles.or}>OR</Text><View style={styles.line} /></View>
        <Pressable disabled={busy} onPress={guest} style={styles.guest}><Text style={styles.guestText}>Continue as guest</Text></Pressable>
        <Text style={styles.note}>Guest mode is useful for testing. Create an account when you want your learning data tied to your email.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#F6F7FB',alignItems:'center',justifyContent:'center',padding:24},
  card:{width:'100%',maxWidth:460,backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:28,padding:28,shadowOpacity:.08,shadowRadius:20,elevation:4},
  brandMark:{width:48,height:48,borderRadius:15,backgroundColor:'#5B5CE2',alignItems:'center',justifyContent:'center'},brandMarkText:{color:'#fff',fontSize:21,fontWeight:'900'},brand:{fontSize:22,fontWeight:'900',color:'#172033',marginTop:13},dot:{color:'#5B5CE2'},title:{fontSize:28,fontWeight:'900',color:'#172033',marginTop:18},subtitle:{fontSize:14,lineHeight:20,color:'#667085',marginTop:7,marginBottom:22},label:{fontSize:12,fontWeight:'800',color:'#344054',marginBottom:7,marginTop:10},input:{minHeight:48,borderWidth:1,borderColor:'#D9DCE5',borderRadius:12,paddingHorizontal:13,color:'#172033',fontSize:14},primary:{minHeight:50,borderRadius:13,backgroundColor:'#5B5CE2',alignItems:'center',justifyContent:'center',marginTop:18},primaryText:{color:'#fff',fontWeight:'900',fontSize:14},disabled:{opacity:.5},switchButton:{alignItems:'center',paddingVertical:14},switchText:{color:'#5B5CE2',fontWeight:'800',fontSize:12},divider:{flexDirection:'row',alignItems:'center',gap:9,marginVertical:6},line:{height:1,backgroundColor:'#E7E9F0',flex:1},or:{fontSize:9,fontWeight:'900',color:'#98A2B3'},guest:{minHeight:48,borderRadius:13,borderWidth:1,borderColor:'#D9DCE5',alignItems:'center',justifyContent:'center'},guestText:{color:'#344054',fontWeight:'900',fontSize:13},note:{fontSize:10,lineHeight:15,color:'#98A2B3',textAlign:'center',marginTop:10},error:{backgroundColor:'#FFF4F4',borderRadius:10,padding:10,marginTop:12},errorText:{color:'#B42318',fontSize:12,lineHeight:17},message:{backgroundColor:'#ECFDF3',borderRadius:10,padding:10,marginTop:12},messageText:{color:'#067647',fontSize:12,lineHeight:17}
});
