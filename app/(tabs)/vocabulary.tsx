import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../lib/theme';

type VocabularyWord = { id: string; word: string; meaning: string | null; definition: string | null; example_sentence: string | null; level: string | null; pronunciation: string | null; part_of_speech?: string | null; source_file?: string | null };
const PAGE_SIZE = 30;
const cleanSearch = (value: string) => value.replace(/[,%()]/g, ' ').trim();
const displayMeaning = (item: VocabularyWord) => item.meaning || item.definition || 'Meaning not available';
const hasRealText = (value: string | null | undefined) => Boolean(value && /[\p{L}\p{N}]/u.test(value));
const isUsableWord = (item: VocabularyWord) => hasRealText(item.word);

export default function VocabularyScreen() {
  const { theme } = useTheme();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<VocabularyWord | null>(null);
  const [compact, setCompact] = useState(false);
  const offset = useRef(0);
  const normalizedSearch = useMemo(() => cleanSearch(search), [search]);
  const hasMore = words.length < totalWords;

  const load = useCallback(async (reset = true) => {
    reset ? setLoading(true) : setLoadingMore(true);
    setError(null);
    const from = reset ? 0 : offset.current;
    const to = from + PAGE_SIZE - 1;
    let q = supabase.from('vocabulary').select('id, word, meaning, definition, example_sentence, level, pronunciation, part_of_speech, source_file').order('word', { ascending: true }).order('id', { ascending: true }).range(from, to);
    let cq = supabase.from('vocabulary').select('id', { count: 'exact', head: true });
    if (normalizedSearch) {
      const filter = `word.ilike.%${normalizedSearch}%,meaning.ilike.%${normalizedSearch}%,definition.ilike.%${normalizedSearch}%`;
      q = q.or(filter); cq = cq.or(filter);
    }
    const [result, count] = await Promise.all([q, cq]);
    if (result.error) { setError(result.error.message); setLoading(false); setLoadingMore(false); return; }
    if (count.error) { setError(count.error.message); setLoading(false); setLoadingMore(false); return; }
    const next = ((result.data ?? []) as VocabularyWord[]).filter(isUsableWord);
    offset.current = reset ? (result.data ?? []).length : offset.current + (result.data ?? []).length;
    setWords((current) => reset ? next : [...current, ...next]);
    setTotalWords(count.count ?? 0);
    setLoading(false); setLoadingMore(false);
  }, [normalizedSearch]);

  useEffect(() => { const timer = setTimeout(() => load(true), 200); return () => clearTimeout(timer); }, [load]);
  const refresh = async () => { setRefreshing(true); await load(true); setRefreshing(false); };

  const renderItem = ({ item }: { item: VocabularyWord }) => (
    <Pressable onPress={() => setSelected(item)} style={({ pressed }) => [styles.row, { backgroundColor: pressed ? theme.soft : theme.surface, borderColor: theme.line }]}>
      <View style={styles.rowMain}>
        <View style={styles.titleLine}>
          <Text style={[styles.word, { color: theme.ink }]} selectable>{String(item.word || 'Untitled')}</Text>
          {item.level ? <Text style={[styles.level, { color: theme.primary, backgroundColor: theme.soft }]}>{item.level}</Text> : null}
        </View>
        {!compact ? <Text style={[styles.meaning, { color: theme.muted }]} numberOfLines={2} selectable>{String(displayMeaning(item))}</Text> : null}
        {!compact && item.example_sentence && hasRealText(item.example_sentence) ? <Text style={[styles.example, { color: theme.muted }]} numberOfLines={1} selectable>Example: {String(item.example_sentence)}</Text> : null}
      </View>
      <Text style={[styles.chevron, { color: theme.muted }]}>›</Text>
    </Pressable>
  );

  return <View style={[styles.screen, { backgroundColor: theme.bg }]}>
    <FlatList data={words} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary} />}
      ListHeaderComponent={<>
        <Text style={[styles.eyebrow, { color: theme.primary }]}>VOCABULARY</Text>
        <Text style={[styles.title, { color: theme.ink }]}>Your word library.</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>Your imported vocabulary, ready to learn.</Text>
        <View style={styles.actions}><Pressable onPress={() => router.push('/practice')} style={[styles.primary, { backgroundColor: theme.primary }]}><Text style={styles.primaryText}>Practice words</Text></Pressable><View style={[styles.counter, { backgroundColor: theme.surface, borderColor: theme.line }]}><Text style={[styles.counterText, { color: theme.muted }]}>{totalWords.toLocaleString()} records</Text></View></View>
        <View style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.line }]}><Text style={[styles.searchIcon, { color: theme.muted }]}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Search word, meaning or definition" placeholderTextColor={theme.muted} style={[styles.input, { color: theme.ink }]} autoCapitalize="none" autoCorrect={false} />{search ? <Pressable onPress={() => setSearch('')}><Text style={[styles.clear, { color: theme.muted }]}>×</Text></Pressable> : null}</View>
        <View style={styles.tools}><Pressable onPress={() => setCompact(v => !v)} style={[styles.chip, { backgroundColor: theme.surface, borderColor: theme.line }]}><Text style={[styles.chipText, { color: theme.primary }]}>{compact ? 'Show details' : 'Compact list'}</Text></Pressable><Text style={[styles.hint, { color: theme.muted }]}>{normalizedSearch ? `${totalWords.toLocaleString()} matches` : 'Tap any word for details'}</Text></View>
        {loading ? <View style={styles.loading}><ActivityIndicator color={theme.primary}/><Text style={[styles.loadingText,{color:theme.muted}]}>Loading vocabulary…</Text></View> : null}
        {!loading && error ? <View style={[styles.error,{backgroundColor:theme.surfaceAlt}]}><Text style={[styles.errorTitle,{color:theme.ink}]}>Couldn’t load vocabulary</Text><Text style={[styles.errorText,{color:theme.muted}]}>{error}</Text><Pressable onPress={() => load(true)} style={[styles.retry,{backgroundColor:theme.primary}]}><Text style={styles.primaryText}>Try again</Text></Pressable></View> : null}
        {!loading && !error && words.length === 0 ? <View style={[styles.empty,{backgroundColor:theme.surface,borderColor:theme.line}]}><Text style={[styles.emptyTitle,{color:theme.ink}]}>No words found</Text><Text style={[styles.emptyText,{color:theme.muted}]}>Try another search.</Text></View> : null}
      </>}
      ListFooterComponent={!loading && !error && hasMore ? <Pressable onPress={() => load(false)} disabled={loadingMore} style={[styles.loadMore,{backgroundColor:theme.surface,borderColor:theme.line}]}>{loadingMore ? <ActivityIndicator color={theme.primary}/> : <Text style={[styles.loadMoreText,{color:theme.primary}]}>Load more words</Text>}</Pressable> : <Text style={[styles.end,{color:theme.muted}]}>End of this vocabulary view</Text>}
    />
    <Modal visible={!!selected} transparent animationType="slide" onRequestClose={() => setSelected(null)}><View style={styles.backdrop}><View style={[styles.modal,{backgroundColor:theme.surface}]}><View style={styles.modalHead}><View style={{flex:1}}><Text style={[styles.modalWord,{color:theme.ink}]}>{selected?.word}</Text>{selected?.level ? <Text style={[styles.level,{color:theme.primary,backgroundColor:theme.soft}]}>{selected.level}</Text> : null}</View><Pressable onPress={() => setSelected(null)} style={[styles.close,{backgroundColor:theme.surfaceAlt}]}><Text style={[styles.closeText,{color:theme.muted}]}>×</Text></Pressable></View>{selected?.pronunciation ? <Text style={[styles.pronunciation,{color:theme.primary}]}>{selected.pronunciation}</Text> : null}<Text style={[styles.detailLabel,{color:theme.primary}]}>Meaning</Text><Text style={[styles.detail,{color:theme.ink}]}>{selected ? displayMeaning(selected) : ''}</Text>{selected?.definition ? <><Text style={[styles.detailLabel,{color:theme.primary}]}>Definition</Text><Text style={[styles.detail,{color:theme.ink}]}>{selected.definition}</Text></> : null}{selected?.example_sentence ? <><Text style={[styles.detailLabel,{color:theme.primary}]}>Example</Text><Text style={[styles.detail,{color:theme.muted}]}>{selected.example_sentence}</Text></> : null}<Pressable onPress={() => { setSelected(null); router.push('/practice'); }} style={[styles.primary,{backgroundColor:theme.primary,marginTop:20}]}><Text style={styles.primaryText}>Practice this word →</Text></Pressable></View></View></Modal>
  </View>;
}

const styles=StyleSheet.create({screen:{flex:1},content:{padding:24,paddingBottom:40},eyebrow:{fontSize:11,fontWeight:'900',letterSpacing:1},title:{fontSize:30,fontWeight:'900',marginTop:5},subtitle:{fontSize:14,marginTop:7,marginBottom:16},actions:{flexDirection:'row',gap:10,alignItems:'center',marginBottom:12},primary:{alignSelf:'flex-start',borderRadius:12,paddingHorizontal:15,paddingVertical:11},primaryText:{color:'#fff',fontWeight:'900'},counter:{borderWidth:1,borderRadius:12,paddingHorizontal:13,paddingVertical:10},counterText:{fontSize:12,fontWeight:'800'},search:{minHeight:50,borderWidth:1,borderRadius:14,flexDirection:'row',alignItems:'center',paddingHorizontal:12},searchIcon:{fontSize:23,marginRight:6},input:{flex:1,fontSize:14,paddingVertical:12},clear:{fontSize:22,paddingHorizontal:6},tools:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginVertical:12},chip:{borderWidth:1,borderRadius:10,paddingHorizontal:11,paddingVertical:8},chipText:{fontSize:12,fontWeight:'900'},hint:{fontSize:12},loading:{padding:24,alignItems:'center',gap:8},loadingText:{fontSize:12},row:{minHeight:78,borderWidth:1,borderRadius:15,padding:14,marginBottom:8,flexDirection:'row',alignItems:'center'},rowMain:{flex:1,paddingRight:12},titleLine:{flexDirection:'row',alignItems:'center',gap:8},word:{fontSize:16,fontWeight:'900'},meaning:{fontSize:13,lineHeight:19,marginTop:5},example:{fontSize:11,marginTop:3},level:{fontSize:9,fontWeight:'900',paddingHorizontal:7,paddingVertical:3,borderRadius:7,overflow:'hidden'},chevron:{fontSize:26},error:{padding:16,borderRadius:14,marginBottom:10},errorTitle:{fontWeight:'900'},errorText:{fontSize:12,marginTop:5,lineHeight:18},retry:{marginTop:10,borderRadius:9,paddingHorizontal:12,paddingVertical:8,alignSelf:'flex-start'},empty:{borderWidth:1,borderRadius:15,padding:24,alignItems:'center'},emptyTitle:{fontSize:16,fontWeight:'900'},emptyText:{fontSize:12,marginTop:4},loadMore:{minHeight:46,borderWidth:1,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:5},loadMoreText:{fontWeight:'900'},end:{textAlign:'center',fontSize:11,paddingVertical:18},backdrop:{flex:1,backgroundColor:'rgba(0,0,0,.45)',justifyContent:'flex-end'},modal:{maxHeight:'82%',borderTopLeftRadius:24,borderTopRightRadius:24,padding:22},modalHead:{flexDirection:'row',alignItems:'flex-start'},modalWord:{fontSize:30,fontWeight:'900',marginBottom:8},close:{width:36,height:36,borderRadius:18,alignItems:'center',justifyContent:'center'},closeText:{fontSize:24},pronunciation:{fontSize:14,fontWeight:'800',marginBottom:12},detailLabel:{fontSize:10,fontWeight:'900',letterSpacing:1,marginTop:12},detail:{fontSize:15,lineHeight:22,marginTop:4}});