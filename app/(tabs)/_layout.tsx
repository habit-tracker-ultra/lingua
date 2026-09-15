import { Slot, usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/theme';

const items = [
  { name: '/', label: 'Home', icon: '⌂' },
  { name: '/vocabulary', label: 'Words', icon: 'Aa' },
  { name: '/flashcards', label: 'Flashcards', icon: '▣' },
  { name: '/practice', label: 'Practice', icon: '✓' },
  { name: '/speak', label: 'Speak', icon: '◉' },
  { name: '/progress', label: 'Progress', icon: '↗' },
  { name: '/import', label: 'Bulk Import', icon: '⇧' },
];

export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(Platform.OS === 'web');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const go = (name: string) => { router.push(name as never); if (Platform.OS !== 'web') setSidebarOpen(false); };
  const signOut = async () => { setSigningOut(true); await supabase.auth.signOut(); setSigningOut(false); };

  return <View style={[styles.shell, { backgroundColor: theme.bg }]}>
    {sidebarOpen ? <View style={[styles.sidebar, { backgroundColor: theme.surface, borderRightColor: theme.line }]}>
      <View style={styles.brandRow}><View style={[styles.brandMark, { backgroundColor: theme.primary }]}><Text style={styles.brandMarkText}>L</Text></View><View style={styles.brandCopy}><Text style={[styles.brandName, { color: theme.ink }]}>Lingua<Text style={{ color: theme.primary }}>.</Text></Text><Text style={[styles.brandTag, { color: theme.muted }]}>English, made natural.</Text></View><Pressable onPress={() => setSidebarOpen(false)} style={[styles.collapseButton, { backgroundColor: theme.surfaceAlt }]} accessibilityLabel="Hide sidebar"><Text style={[styles.collapseText, { color: theme.muted }]}>‹</Text></Pressable></View>
      <Text style={[styles.sectionLabel, { color: theme.muted }]}>LEARN</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.navList}>
        {items.map((item) => { const focused = item.name === '/' ? pathname === '/' : pathname.startsWith(item.name); const hovered = hoveredItem === item.name; return <Pressable key={item.name} onPress={() => go(item.name)} onHoverIn={() => setHoveredItem(item.name)} onHoverOut={() => setHoveredItem(null)} style={[styles.navItem, (focused || hovered) && { backgroundColor: theme.soft }]}><View style={[styles.iconBox, focused ? { backgroundColor: theme.primary } : { backgroundColor: hovered ? theme.soft : theme.surfaceAlt }]}><Text style={[styles.icon, { color: focused ? '#fff' : theme.muted }]}>{item.icon}</Text></View><Text style={[styles.navLabel, { color: focused ? theme.primary : theme.ink }]}>{item.label}</Text>{focused ? <View style={[styles.activeBar, { backgroundColor: theme.primary }]} /> : null}</Pressable>; })}
      </ScrollView>
      <View style={[styles.profileActions, { borderTopColor: theme.line }]}>
        <Pressable onPress={() => go('/profile')} onHoverIn={() => setHoveredItem('profile')} onHoverOut={() => setHoveredItem(null)} style={[styles.profileButton, { backgroundColor: pathname.startsWith('/profile') || hoveredItem === 'profile' ? theme.soft : theme.surfaceAlt }]}><View style={[styles.profileIcon, { backgroundColor: pathname.startsWith('/profile') ? theme.primary : theme.surface }]}><Text style={[styles.profileIconText, { color: pathname.startsWith('/profile') ? '#fff' : theme.muted }]}>L</Text></View><View style={{ flex:1 }}><Text style={[styles.profileName, { color: pathname.startsWith('/profile') ? theme.primary : theme.ink }]}>Profile</Text><Text style={[styles.profileMeta, { color: theme.muted }]}>Account & appearance</Text></View></Pressable>
        <Pressable onPress={() => go('/about-developer')} onHoverIn={() => setHoveredItem('about-developer')} onHoverOut={() => setHoveredItem(null)} style={[styles.aboutButton, { backgroundColor: pathname.startsWith('/about-developer') || hoveredItem === 'about-developer' ? theme.soft : theme.surfaceAlt }]}><Text style={[styles.aboutIcon, { color: pathname.startsWith('/about-developer') ? theme.primary : theme.muted }]}>i</Text><View style={{ flex:1 }}><Text style={[styles.aboutName, { color: pathname.startsWith('/about-developer') ? theme.primary : theme.ink }]}>About Developer</Text><Text style={[styles.profileMeta, { color: theme.muted }]}>Meet the creator</Text></View></Pressable>
        <Text style={[styles.rightsText, { color: theme.muted }]}>All rights reserved to Rajat.</Text>
        <Pressable onPress={signOut} disabled={signingOut} style={[styles.signOut, { backgroundColor: theme.surfaceAlt }]}><Text style={[styles.signOutText, { color: theme.muted }]}>{signingOut ? '…' : 'Sign out ↪'}</Text></Pressable>
      </View>
    </View> : null}
    <View style={styles.content}>{!sidebarOpen ? <Pressable onPress={() => setSidebarOpen(true)} style={[styles.menuButton, { backgroundColor: theme.primary }]} accessibilityLabel="Show sidebar"><Text style={styles.menuText}>☰</Text></Pressable> : null}<Slot /></View>
  </View>;
}

const styles=StyleSheet.create({shell:{flex:1,flexDirection:'row',minHeight:'100%'},sidebar:{width:252,borderRightWidth:1,paddingHorizontal:14,paddingTop:18,paddingBottom:12},content:{flex:1,minWidth:0,position:'relative'},brandRow:{height:58,flexDirection:'row',alignItems:'center',paddingHorizontal:4,marginBottom:18},brandMark:{width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center'},brandMarkText:{color:'#fff',fontWeight:'900',fontSize:18},brandCopy:{marginLeft:10,flex:1},brandName:{fontSize:20,fontWeight:'900',letterSpacing:-.5},brandTag:{fontSize:9,marginTop:1},collapseButton:{width:30,height:30,borderRadius:10,alignItems:'center',justifyContent:'center'},collapseText:{fontSize:22,lineHeight:22,fontWeight:'700'},sectionLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.2,paddingHorizontal:8,marginBottom:8},navList:{paddingBottom:16},navItem:{height:50,borderRadius:14,flexDirection:'row',alignItems:'center',paddingHorizontal:8,marginBottom:4,position:'relative'},iconBox:{width:34,height:34,borderRadius:10,alignItems:'center',justifyContent:'center'},icon:{fontSize:15,fontWeight:'900'},navLabel:{fontSize:13,fontWeight:'800',marginLeft:10},activeBar:{position:'absolute',right:5,width:3,height:23,borderRadius:3},profileActions:{borderTopWidth:1,paddingTop:10,gap:8},profileButton:{minHeight:54,borderRadius:14,paddingHorizontal:8,flexDirection:'row',alignItems:'center',gap:9},profileIcon:{width:34,height:34,borderRadius:10,alignItems:'center',justifyContent:'center'},profileIconText:{fontWeight:'900',fontSize:13},profileName:{fontSize:12,fontWeight:'900'},profileMeta:{fontSize:9,marginTop:1},aboutButton:{minHeight:48,borderRadius:14,paddingHorizontal:8,flexDirection:'row',alignItems:'center',gap:9},aboutIcon:{width:34,height:34,borderRadius:10,textAlign:'center',textAlignVertical:'center',fontWeight:'900',fontSize:17,backgroundColor:'transparent'},aboutName:{fontSize:12,fontWeight:'900'},rightsText:{fontSize:8,textAlign:'center',marginTop:2,marginBottom:1},signOut:{borderRadius:10,paddingVertical:9,alignItems:'center'},signOutText:{fontSize:10,fontWeight:'800'},menuButton:{position:'absolute',left:16,top:16,zIndex:20,width:42,height:42,borderRadius:13,alignItems:'center',justifyContent:'center',shadowOpacity:.18,shadowRadius:8,elevation:4},menuText:{color:'#fff',fontSize:19,fontWeight:'900'}});
