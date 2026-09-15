import { Tabs } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme, themes, ThemeName } from '../../lib/theme';

const primaryItems = [
  { name: 'index', label: 'Home', icon: '⌂' },
  { name: 'vocabulary', label: 'Words', icon: 'Aa' },
  { name: 'flashcards', label: 'Flashcards', icon: '▣' },
  { name: 'practice', label: 'Practice', icon: '✓' },
  { name: 'speak', label: 'Speak', icon: '◉' },
  { name: 'progress', label: 'Progress', icon: '↗' },
];

const secondaryItems = [{ name: 'import', label: 'Bulk Import', icon: '⇧' }];

function Sidebar({ state, navigation }: any) {
  const { theme, themeName, setTheme } = useTheme();
  const compact = Platform.OS !== 'web';
  const items = [...primaryItems, ...secondaryItems];

  return (
    <View style={[styles.sidebar, { backgroundColor: theme.surface, borderRightColor: theme.line }, compact && styles.sidebarCompact]}>
      <View style={styles.brand}>
        <View style={[styles.brandMark, { backgroundColor: theme.primary }]}><Text style={styles.brandMarkText}>L</Text></View>
        {!compact ? <View><Text style={[styles.brandName, { color: theme.ink }]}>Lingua<Text style={{ color: theme.primary }}>.</Text></Text><Text style={[styles.brandTag, { color: theme.muted }]}>English, made natural.</Text></View> : null}
      </View>

      {!compact ? <Text style={[styles.sectionLabel, { color: theme.muted }]}>LEARN</Text> : null}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.navList}>
        {items.map((item) => {
          const routeIndex = state.routes.findIndex((route: any) => route.name === item.name);
          const focused = state.index === routeIndex;
          return (
            <Pressable key={item.name} onPress={() => navigation.navigate(item.name)} style={[styles.navItem, focused && { backgroundColor: theme.soft }, compact && styles.navItemCompact]}>
              <View style={[styles.iconBox, focused && { backgroundColor: theme.primary }, !focused && { backgroundColor: theme.surfaceAlt }]}><Text style={[styles.icon, { color: focused ? '#fff' : theme.muted }]}>{item.icon}</Text></View>
              {!compact ? <Text style={[styles.navLabel, { color: focused ? theme.primary : theme.ink }]}>{item.label}</Text> : null}
              {!compact && focused ? <View style={[styles.activeBar, { backgroundColor: theme.primary }]} /> : null}
            </Pressable>
          );
        })}

        {!compact ? <>
          <Text style={[styles.sectionLabel, { color: theme.muted, marginTop: 18 }]}>APPEARANCE</Text>
          <View style={[styles.themePanel, { backgroundColor: theme.surfaceAlt, borderColor: theme.line }]}>
            <Text style={[styles.themeTitle, { color: theme.ink }]}>Choose your vibe</Text>
            <Text style={[styles.themeSubtitle, { color: theme.muted }]}>Your theme is saved on this device.</Text>
            <View style={styles.themeGrid}>
              {themes.map((item) => <Pressable key={item.name} onPress={() => setTheme(item.name as ThemeName)} style={[styles.themeChip, { borderColor: themeName === item.name ? theme.primary : theme.line, backgroundColor: item.bg }]}><Text style={styles.themeEmoji}>{item.emoji}</Text><Text style={[styles.themeChipText, { color: item.ink }]}>{item.label}</Text></Pressable>)}
            </View>
          </View>
        </> : null}
      </ScrollView>

      {!compact ? <View style={[styles.profile, { borderTopColor: theme.line }]}><View style={[styles.avatar, { backgroundColor: theme.primary }]}><Text style={styles.avatarText}>L</Text></View><View><Text style={[styles.profileName, { color: theme.ink }]}>Learner</Text><Text style={[styles.profileMeta, { color: theme.muted }]}>Personal space</Text></View></View> : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <Sidebar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="vocabulary" options={{ title: 'Vocabulary' }} />
      <Tabs.Screen name="flashcards" options={{ title: 'Flashcards' }} />
      <Tabs.Screen name="practice" options={{ title: 'Practice' }} />
      <Tabs.Screen name="speak" options={{ title: 'Speak' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="import" options={{ title: 'Bulk Import' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sidebar:{width:236,borderRightWidth:1,paddingHorizontal:14,paddingTop:22,paddingBottom:14},sidebarCompact:{width:82,paddingHorizontal:8,paddingTop:18},brand:{flexDirection:'row',alignItems:'center',gap:10,paddingHorizontal:5,marginBottom:26},brandMark:{width:38,height:38,borderRadius:12,alignItems:'center',justifyContent:'center'},brandMarkText:{color:'#fff',fontWeight:'900',fontSize:17},brandName:{fontSize:20,fontWeight:'900',letterSpacing:-.5},brandTag:{fontSize:9,marginTop:1},sectionLabel:{fontSize:9,fontWeight:'900',letterSpacing:1.2,paddingHorizontal:8,marginBottom:8},navList:{paddingBottom:14},navItem:{height:50,borderRadius:14,flexDirection:'row',alignItems:'center',paddingHorizontal:8,marginBottom:4,position:'relative'},navItemCompact:{justifyContent:'center',paddingHorizontal:0},iconBox:{width:34,height:34,borderRadius:10,alignItems:'center',justifyContent:'center'},icon:{fontSize:15,fontWeight:'900'},navLabel:{fontSize:13,fontWeight:'800',marginLeft:10},activeBar:{position:'absolute',right:5,width:3,height:23,borderRadius:3},themePanel:{borderWidth:1,borderRadius:16,padding:10},themeTitle:{fontSize:12,fontWeight:'900'},themeSubtitle:{fontSize:9,lineHeight:13,marginTop:3},themeGrid:{flexDirection:'row',flexWrap:'wrap',gap:6,marginTop:9},themeChip:{width:92,minHeight:40,borderWidth:1.5,borderRadius:11,padding:6,flexDirection:'row',alignItems:'center',gap:5},themeEmoji:{fontSize:13},themeChipText:{fontSize:9,fontWeight:'800',flexShrink:1},profile:{borderTopWidth:1,paddingTop:12,flexDirection:'row',alignItems:'center',gap:9},avatar:{width:32,height:32,borderRadius:16,alignItems:'center',justifyContent:'center'},avatarText:{color:'#fff',fontWeight:'900',fontSize:12},profileName:{fontSize:11,fontWeight:'900'},profileMeta:{fontSize:9,marginTop:1}
});
