import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

function AuthGate(){const pathname=usePathname();const{theme}=useTheme();const[ready,setReady]=useState(false);const[hasSession,setHasSession]=useState(false);useEffect(()=>{let mounted=true;supabase.auth.getSession().then(({data})=>{if(!mounted)return;setHasSession(Boolean(data.session));setReady(true);if(!data.session&&pathname!=='/auth')router.replace('/auth');if(data.session&&pathname==='/auth')router.replace('/')});const{data:listener}=supabase.auth.onAuthStateChange((_event,session)=>{if(!mounted)return;setHasSession(Boolean(session));if(!session&&pathname!=='/auth')router.replace('/auth');if(session&&pathname==='/auth')router.replace('/')});return()=>{mounted=false;listener.subscription.unsubscribe()}},[pathname]);if(!ready)return <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:theme.bg}}><ActivityIndicator color={theme.primary}/></View>;if(!hasSession&&pathname!=='/auth')return null;return <><StatusBar style={themeNameIsDark(theme.ink)?'light':'dark'}/><Stack screenOptions={{headerShown:false}}><Stack.Screen name="(tabs)"/><Stack.Screen name="auth"/></Stack></>}
const themeNameIsDark=(ink:string)=>ink.toLowerCase()==='#f5f7ff'||ink.toLowerCase()==='#f7f9ff';
export default function RootLayout(){return <ThemeProvider><AuthGate/></ThemeProvider>}
