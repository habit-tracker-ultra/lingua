import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { supabase } from '../../lib/supabase';

type ImportRow = { word: string; normalized_word: string; meaning?: string; definition?: string; example_sentence?: string; level?: string; pronunciation?: string; part_of_speech?: string; source_file?: string; source_row?: number; source_hash?: string; metadata?: Record<string, unknown> };

function csvRows(text: string) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [] as ImportRow[];
  const parse = (line: string) => { const out: string[] = []; let cell = ''; let quote = false; for (let i=0;i<line.length;i++){ const c=line[i]; if(c==='"' && line[i+1]==='"'){cell+='"';i++;continue;} if(c==='"'){quote=!quote;continue;} if(c===','&&!quote){out.push(cell.trim());cell='';}else cell+=c;} out.push(cell.trim()); return out; };
  const headers = parse(lines[0]).map((x) => x.toLowerCase().replace(/\s+/g, '_'));
  const rows: ImportRow[] = [];
  for (let i=1;i<lines.length;i++) { const values=parse(lines[i]); const raw: Record<string,string>={}; headers.forEach((h,n)=>{raw[h]=values[n]??'';}); const word=(raw.word||raw.vocabulary||raw.term||'').trim(); if(!word) continue; rows.push({ word, normalized_word: word.toLowerCase().trim(), meaning: raw.meaning||'', definition: raw.definition||'', example_sentence: raw.example_sentence||raw.example||'', level: raw.level||'', pronunciation: raw.pronunciation||'', part_of_speech: raw.part_of_speech||'', source_file: raw.source_file||'bulk-import.csv', source_row: Number(raw.source_row)||i+1, metadata: {} }); }
  return rows;
}

export default function ImportScreen() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [status, setStatus] = useState('Pick a CSV or paste CSV text below.');
  const [busy, setBusy] = useState(false);

  async function pick() {
    setStatus('');
    const result = await DocumentPicker.getDocumentAsync({ type: ['text/csv', 'text/plain', 'application/csv'], copyToCacheDirectory: true });
    if (result.canceled) return;
    const asset = result.assets[0];
    let contents = '';
    if (asset.file && typeof asset.file.text === 'function') contents = await asset.file.text();
    else contents = await new File(asset.uri).text();
    setFileName(asset.name || 'import.csv'); setText(contents); setRows(csvRows(contents)); setStatus(`Ready: ${csvRows(contents).length.toLocaleString()} rows.`);
  }

  function preview() { const parsed=csvRows(text); setRows(parsed); setStatus(`${parsed.length.toLocaleString()} valid rows detected.`); }

  async function importRows() {
    if (!rows.length) { setStatus('Nothing to import. Pick a file or paste CSV first.'); return; }
    setBusy(true); setStatus('Signing in to the private import session…');
    let { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      const result = await supabase.auth.signInAnonymously();
      if (result.error) { setStatus(`Enable Supabase anonymous sign-ins first: ${result.error.message}`); setBusy(false); return; }
      sessionData = { session: result.data.session };
    }
    const userId = sessionData.session?.user.id;
    if (!userId) { setStatus('Could not create an import session.'); setBusy(false); return; }
    const batch = await supabase.from('import_batches').insert({ created_by: userId, file_name: fileName || 'bulk-import.csv', file_type: 'csv', total_records: rows.length, imported_records: 0, skipped_records: 0, duplicate_records: 0, duplicate_action: 'preserve', status: 'processing' }).select('id').single();
    if (batch.error || !batch.data) { setStatus(batch.error?.message || 'Could not create import batch.'); setBusy(false); return; }
    let imported=0, failed=0;
    for (let start=0; start<rows.length; start+=250) {
      const chunk=rows.slice(start,start+250);
      const result=await supabase.from('vocabulary').insert(chunk);
      if(result.error) { failed += chunk.length; setStatus(`Import stopped at row ${start+1}: ${result.error.message}`); break; }
      imported += chunk.length; setStatus(`Imported ${imported.toLocaleString()} / ${rows.length.toLocaleString()} rows…`);
    }
    await supabase.from('import_batches').update({ imported_records: imported, skipped_records: failed, status: failed ? 'completed_with_errors' : 'completed', completed_at: new Date().toISOString() }).eq('id', batch.data.id);
    setStatus(`Import complete: ${imported.toLocaleString()} imported${failed ? `, ${failed.toLocaleString()} failed` : ''}.`); setBusy(false);
  }

  return <ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.eyebrow}>BULK IMPORT</Text><Text style={styles.title}>Bring in vocabulary at scale.</Text><Text style={styles.subtitle}>CSV import is back. Existing records are preserved, so duplicate vocabulary rows are allowed.</Text>
    <View style={styles.card}><Pressable style={styles.primary} onPress={pick} disabled={busy}><Text style={styles.primaryText}>Choose CSV file</Text></Pressable><Text style={styles.or}>or paste CSV text</Text><TextInput value={text} onChangeText={setText} multiline placeholder="word,meaning,definition,example_sentence,level\nabandon,leave behind,..." placeholderTextColor="#98A2B3" style={styles.textarea}/><View style={styles.row}><Pressable style={styles.secondary} onPress={preview} disabled={busy}><Text style={styles.secondaryText}>Preview</Text></Pressable><Pressable style={styles.primary} onPress={importRows} disabled={busy || !rows.length}>{busy ? <ActivityIndicator color="#fff"/> : <Text style={styles.primaryText}>Import {rows.length ? rows.length.toLocaleString() : ''} rows</Text>}</Pressable></View><Text style={styles.status}>{status}</Text></View>
    {rows.length ? <View style={styles.card}><Text style={styles.section}>Preview</Text>{rows.slice(0,8).map((row,i)=><View key={`${row.word}-${i}`} style={styles.preview}><Text style={styles.word}>{row.word}</Text><Text style={styles.meaning}>{row.meaning || row.definition || 'No meaning'}</Text></View>)}{rows.length>8?<Text style={styles.muted}>Showing first 8 rows of {rows.length.toLocaleString()}.</Text>:null}</View>:null}
    <View style={styles.note}><Text style={styles.noteTitle}>Private testing note</Text><Text style={styles.muted}>The importer uses a Supabase authenticated session. If anonymous sign-in is disabled, the app will tell you exactly what to enable.</Text></View>
  </ScrollView>;
}
const styles=StyleSheet.create({screen:{flexGrow:1,backgroundColor:'#F6F7FB',padding:20,paddingTop:24,paddingBottom:40},eyebrow:{color:'#5B5CE2',fontSize:12,fontWeight:'900',letterSpacing:1},title:{color:'#172033',fontSize:30,fontWeight:'900',marginTop:5},subtitle:{color:'#667085',fontSize:14,lineHeight:20,marginTop:7,marginBottom:16},card:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E7E9F0',borderRadius:20,padding:18,marginBottom:14,maxWidth:800,width:'100%',alignSelf:'center'},primary:{backgroundColor:'#5B5CE2',borderRadius:12,paddingHorizontal:15,paddingVertical:12,alignItems:'center'},primaryText:{color:'#fff',fontWeight:'900'},or:{color:'#667085',fontSize:12,textAlign:'center',marginVertical:10},textarea:{minHeight:180,borderWidth:1,borderColor:'#D9DCE5',borderRadius:14,padding:12,color:'#172033',fontSize:12,textAlignVertical:'top'},row:{flexDirection:'row',gap:10,alignItems:'center',marginTop:10},secondary:{borderWidth:1,borderColor:'#D9DCE5',backgroundColor:'#fff',borderRadius:12,paddingHorizontal:15,paddingVertical:12},secondaryText:{color:'#596174',fontWeight:'900'},status:{color:'#5B5CE2',fontWeight:'800',fontSize:12,marginTop:12,lineHeight:18},section:{color:'#172033',fontSize:18,fontWeight:'900',marginBottom:8},preview:{paddingVertical:10,borderBottomWidth:1,borderBottomColor:'#F0F1F6'},word:{color:'#172033',fontWeight:'900'},meaning:{color:'#667085',fontSize:12,marginTop:3},muted:{color:'#667085',fontSize:12,lineHeight:18},note:{maxWidth:800,width:'100%',alignSelf:'center',padding:14,borderRadius:14,backgroundColor:'#EEEFFF'},noteTitle:{color:'#5B5CE2',fontWeight:'900',marginBottom:4}});
