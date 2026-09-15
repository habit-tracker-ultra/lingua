import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ThemeName, themes, useTheme } from '../../lib/theme';

type Profile = { username: string; address: string; pin_code: string; avatar_url: string; theme_name: ThemeName };
const emptyProfile: Profile = { username: '', address: '', pin_code: '', avatar_url: '', theme_name: 'classic' };

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, themeName, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted || !data.user) return;
      setEmail(data.user.email ?? '');
      const { data: row } = await supabase.from('profiles').select('username,address,pin_code,avatar_url,theme_name').eq('id', data.user.id).maybeSingle();
      if (mounted && row) setProfile({ ...emptyProfile, ...row, theme_name: (row.theme_name || 'classic') as ThemeName });
      setBusy(false);
    });
    return () => { mounted = false; };
  }, []);

  const save = async () => {
    setSaving(true); setMessage('');
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) { setMessage('Please sign in again.'); setSaving(false); return; }
    const { error } = await supabase.from('profiles').update({ username: profile.username.trim(), address: profile.address.trim(), pin_code: profile.pin_code.trim(), avatar_url: profile.avatar_url.trim(), theme_name: themeName }).eq('id', user.user.id);
    setMessage(error ? error.message : 'Profile saved.');
    setSaving(false);
  };

  const update = (key: keyof Profile, value: string) => setProfile((p) => ({ ...p, [key]: value }));

  if (busy) return <View style={[styles.center, { backgroundColor: theme.bg }]}><ActivityIndicator color={theme.primary} /></View>;

  return <ScrollView contentContainerStyle={[styles.screen, { backgroundColor: theme.bg }]}>
    <Text style={[styles.eyebrow, { color: theme.primary }]}>PROFILE</Text>
    <Text style={[styles.title, { color: theme.ink }]}>Your learner profile.</Text>
    <Text style={[styles.subtitle, { color: theme.muted }]}>Personalize Lingua and keep your preferences with your account.</Text>

    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <View style={styles.profileHead}>
        {profile.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={styles.avatar} /> : <View style={[styles.avatar, { backgroundColor: theme.primary }]}><Text style={styles.avatarText}>{(profile.username || 'L').slice(0,1).toUpperCase()}</Text></View>}
        <View style={{ flex: 1 }}><Text style={[styles.name, { color: theme.ink }]}>{profile.username || 'Your name'}</Text><Text style={[styles.email, { color: theme.muted }]}>{email}</Text></View>
      </View>
      <Text style={[styles.section, { color: theme.ink }]}>Profile details</Text>
      <Text style={[styles.label, { color: theme.muted }]}>User name</Text>
      <TextInput value={profile.username} onChangeText={(v) => update('username', v)} placeholder="How should Lingua call you?" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.surfaceAlt }]} />
      <Text style={[styles.label, { color: theme.muted }]}>Address</Text>
      <TextInput value={profile.address} onChangeText={(v) => update('address', v)} placeholder="Your address" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.surfaceAlt }]} />
      <Text style={[styles.label, { color: theme.muted }]}>PIN code</Text>
      <TextInput value={profile.pin_code} onChangeText={(v) => update('pin_code', v)} placeholder="PIN / postal code" placeholderTextColor={theme.muted} keyboardType="numeric" style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.surfaceAlt }]} />
      <Text style={[styles.label, { color: theme.muted }]}>Custom profile picture</Text>
      <TextInput value={profile.avatar_url} onChangeText={(v) => update('avatar_url', v)} placeholder="Paste an image URL" placeholderTextColor={theme.muted} autoCapitalize="none" style={[styles.input, { color: theme.ink, borderColor: theme.line, backgroundColor: theme.surfaceAlt }]} />
      <Text style={[styles.helper, { color: theme.muted }]}>Use a direct image URL for now. The picture is shown across your profile.</Text>
      <Pressable onPress={save} disabled={saving} style={[styles.primary, { backgroundColor: theme.primary }]}><Text style={styles.primaryText}>{saving ? 'Saving…' : 'Save profile'}</Text></Pressable>
      {message ? <Text style={[styles.message, { color: theme.primary }]}>{message}</Text> : null}
    </View>

    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.line }]}>
      <Text style={[styles.section, { color: theme.ink }]}>Appearance</Text>
      <Text style={[styles.subtitleSmall, { color: theme.muted }]}>Themes now apply across the complete Lingua experience.</Text>
      <View style={styles.grid}>{themes.map((item) => <Pressable key={item.name} onPress={() => setTheme(item.name)} style={[styles.theme, { borderColor: themeName === item.name ? theme.primary : theme.line, backgroundColor: themeName === item.name ? theme.soft : item.bg }]}><Text style={styles.emoji}>{item.emoji}</Text><Text style={[styles.themeName, { color: item.ink }]}>{item.label}</Text>{themeName === item.name ? <Text style={[styles.selected, { color: theme.primary }]}>✓</Text> : null}</Pressable>)}</View>
    </View>

    <Pressable onPress={() => router.push('/')} style={[styles.back, { borderColor: theme.line, backgroundColor: theme.surface }]}><Text style={[styles.backText, { color: theme.ink }]}>Back to Home</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({ screen:{flexGrow:1,padding:24,paddingBottom:50,maxWidth:900,width:'100%',alignSelf:'center'},center:{flex:1,alignItems:'center',justifyContent:'center'},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:1},title:{fontSize:32,fontWeight:'900',marginTop:5},subtitle:{fontSize:14,lineHeight:20,marginTop:7,marginBottom:16},card:{borderWidth:1,borderRadius:22,padding:20,marginBottom:16},profileHead:{flexDirection:'row',alignItems:'center',gap:13,marginBottom:20},avatar:{width:68,height:68,borderRadius:34,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontSize:24,fontWeight:'900'},name:{fontSize:18,fontWeight:'900'},email:{fontSize:12,marginTop:3},section:{fontSize:18,fontWeight:'900',marginBottom:10},label:{fontSize:11,fontWeight:'800',marginTop:11,marginBottom:6},input:{minHeight:48,borderWidth:1,borderRadius:12,paddingHorizontal:13,fontSize:14},helper:{fontSize:11,lineHeight:16,marginTop:6},primary:{alignSelf:'flex-start',borderRadius:12,paddingHorizontal:18,paddingVertical:12,marginTop:16},primaryText:{color:'#fff',fontWeight:'900'},message:{fontSize:12,fontWeight:'800',marginTop:10},subtitleSmall:{fontSize:12,marginBottom:12},grid:{flexDirection:'row',flexWrap:'wrap',gap:9},theme:{width:150,minHeight:56,borderWidth:1.5,borderRadius:14,padding:9,flexDirection:'row',alignItems:'center',gap:7},emoji:{fontSize:18},themeName:{fontSize:12,fontWeight:'900',flex:1},selected:{fontSize:14,fontWeight:'900'},back:{alignSelf:'flex-start',borderWidth:1,borderRadius:12,paddingHorizontal:16,paddingVertical:11},backText:{fontWeight:'800'}});
