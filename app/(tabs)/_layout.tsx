import { Slot, usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTheme, themes, ThemeName } from '../../lib/theme';

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
  const { theme, themeName, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(Platform.OS === 'web');
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [hoveredTheme, setHoveredTheme] = useState<ThemeName | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const go = (name: string) => {
    router.push(name as never);
    if (Platform.OS !== 'web') setSidebarOpen(false);
  };

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  };

  return (
    <View style={[styles.shell, { backgroundColor: theme.bg }]}>
      {sidebarOpen ? (
        <View style={[styles.sidebar, { backgroundColor: theme.surface, borderRightColor: theme.line }]}>
          <View style={styles.brandRow}>
            <View style={[styles.brandMark, { backgroundColor: theme.primary }]}><Text style={styles.brandMarkText}>L</Text></View>
            <View style={styles.brandCopy}>
              <Text style={[styles.brandName, { color: theme.ink }]}>Lingua<Text style={{ color: theme.primary }}>.</Text></Text>
              <Text style={[styles.brandTag, { color: theme.muted }]}>English, made natural.</Text>
            </View>
            <Pressable onPress={() => setSidebarOpen(false)} style={[styles.collapseButton, { backgroundColor: theme.surfaceAlt }]} accessibilityLabel="Hide sidebar"><Text style={[styles.collapseText, { color: theme.muted }]}>‹</Text></Pressable>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.muted }]}>LEARN</Text>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.navList}>
            {items.map((item) => {
              const focused = item.name === '/' ? pathname === '/' : pathname.startsWith(item.name);
              const hovered = hoveredItem === item.name;
              return <Pressable key={item.name} onPress={() => go(item.name)} onHoverIn={() => setHoveredItem(item.name)} onHoverOut={() => setHoveredItem(null)} style={[styles.navItem, (focused || hovered) && { backgroundColor: theme.soft }]}>
                <View style={[styles.iconBox, focused && { backgroundColor: theme.primary }, !focused && { backgroundColor: hovered ? theme.soft : theme.surfaceAlt }]}><Text style={[styles.icon, { color: focused ? '#fff' : theme.muted }]}>{item.icon}</Text></View>
                <Text style={[styles.navLabel, { color: focused ? theme.primary : theme.ink }]}>{item.label}</Text>
                {focused ? <View style={[styles.activeBar, { backgroundColor: theme.primary }]} /> : null}
              </Pressable>;
            })}

            <View onMouseEnter={() => Platform.OS === 'web' && setAppearanceOpen(true)} onMouseLeave={() => Platform.OS === 'web' && setAppearanceOpen(false)}>
              <Pressable onPress={() => setAppearanceOpen((v) => !v)} style={[styles.navItem, appearanceOpen && { backgroundColor: theme.soft }]}>
                <View style={[styles.iconBox, { backgroundColor: appearanceOpen ? theme.primary : theme.surfaceAlt }]}><Text style={[styles.icon, { color: appearanceOpen ? '#fff' : theme.muted }]}>◐</Text></View>
                <Text style={[styles.navLabel, { color: appearanceOpen ? theme.primary : theme.ink }]}>Appearance</Text>
              </Pressable>
              {appearanceOpen ? <View style={[styles.themePanel, { backgroundColor: theme.surface, borderColor: theme.line }]}>
                <Text style={[styles.themeTitle, { color: theme.ink }]}>Choose your vibe</Text>
                <Text style={[styles.themeSubtitle, { color: theme.muted }]}>Hover or click a theme.</Text>
                <View style={styles.themeGrid}>{themes.map((item) => {
                  const active = themeName === item.name; const hover = hoveredTheme === item.name;
                  return <Pressable key={item.name} onPress={() => setTheme(item.name as ThemeName)} onHoverIn={() => setHoveredTheme(item.name)} onHoverOut={() => setHoveredTheme(null)} style={[styles.themeChip, { borderColor: active ? theme.primary : theme.line, backgroundColor: active || hover ? theme.soft : item.bg }]}><Text style={styles.themeEmoji}>{item.emoji}</Text><Text style={[styles.themeChipText, { color: item.ink }]}>{item.label}</Text></Pressable>;
                })}</View>
              </View> : null}
            </View>
          </ScrollView>

          <View style={[styles.profile, { borderTopColor: theme.line }]}>
            <View style={[styles.avatar, { backgroundColor: theme.primary }]}><Text style={styles.avatarText}>L</Text></View>
            <View style={styles.profileCopy}><Text style={[styles.profileName, { color: theme.ink }]}>Learner</Text><Text style={[styles.profileMeta, { color: theme.muted }]}>Account & progress</Text></View>
            <Pressable onPress={signOut} disabled={signingOut} style={[styles.signOut, { backgroundColor: theme.surfaceAlt }]}><Text style={[styles.signOutText, { color: theme.muted }]}>{signingOut ? '…' : '↪'}</Text></Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.content}>
        {!sidebarOpen ? <Pressable onPress={() => setSidebarOpen(true)} style={[styles.menuButton, { backgroundColor: theme.primary }]} accessibilityLabel="Show sidebar"><Text style={styles.menuText}>☰</Text></Pressable> : null}
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell:{flex:1,flexDirection:'row',minHeight:'100%'},sidebar:{width:252,borderRightWidth:1,paddingHorizontal:14,paddingTop:18,paddingBottom:12},content:{flex:1,minWidth:0,position:'relative'},brandRow:{height:58,flexDirection:'row',alignItems:'center',paddingHorizontal:4,marginBottom:18},brandMark:{width:40,height:40,borderRadius:13,alignItems:'center',justifyContent:'center'},brandMarkText:{color:'#fff',fontWeight:'900',fontSize:18},brandCopy:{marginLeft:10,flex:1},brandName:{fontSize:20,fontWeight:'900',letterSpacing:-.5},brandTag:{fontSize:9,marginTop:1},collapseButton:{width:30,height:30,borderRadius:10,alignItems:'center',justifyContent:'center'},collapseText:{fontSize:22,lineHeight:22,fontWeight:'700'},sectionLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.2,paddingHorizontal:8,marginBottom:8},navList:{paddingBottom:16},navItem:{height:50,borderRadius:14,flexDirection:'row',alignItems:'center',paddingHorizontal:8,marginBottom:4,position:'relative'},iconBox:{width:34,height:34,borderRadius:10,alignItems:'center',justifyContent:'center'},icon:{fontSize:15,fontWeight:'900'},navLabel:{fontSize:13,fontWeight:'800',marginLeft:10},activeBar:{position:'absolute',right:5,width:3,height:23,borderRadius:3},themePanel:{borderWidth:1,borderRadius:16,padding:10,marginTop:2,marginBottom:8,shadowOpacity:0.08,shadowRadius:10,elevation:3},themeTitle:{fontSize:12,fontWeight:'900'},themeSubtitle:{fontSize:9,lineHeight:13,marginTop:3},themeGrid:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:9},themeChip:{width:104,minHeight:40,borderWidth:1.5,borderRadius:11,padding:6,flexDirection:'row',alignItems:'center',gap:5},themeEmoji:{fontSize:13},themeChipText:{fontSize:9,fontWeight:'800',flexShrink:1},profile:{borderTopWidth:1,paddingTop:12,flexDirection:'row',alignItems:'center',gap:9},profileCopy:{flex:1},avatar:{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'900',fontSize:12},profileName:{fontSize:11,fontWeight:'900'},profileMeta:{fontSize:9,marginTop:1},signOut:{width:30,height:30,borderRadius:10,alignItems:'center',justifyContent:'center'},signOutText:{fontSize:15,fontWeight:'900'},menuButton:{position:'absolute',left:16,top:16,zIndex:20,width:42,height:42,borderRadius:13,alignItems:'center',justifyContent:'center',shadowOpacity:0.18,shadowRadius:8,elevation:4},menuText:{color:'#fff',fontSize:19,fontWeight:'900'}
});
