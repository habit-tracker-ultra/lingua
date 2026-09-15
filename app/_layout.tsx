import { Stack, router, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '../lib/theme';
import { supabase } from '../lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

function AuthGate() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(Boolean(data.session));
      setReady(true);
      if (!data.session && pathname !== '/auth') router.replace('/auth');
      if (data.session && pathname === '/auth') router.replace('/');
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setHasSession(Boolean(session));
      if (!session && pathname !== '/auth') router.replace('/auth');
      if (session && pathname === '/auth') router.replace('/');
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [pathname]);

  if (!ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F6F7FB' }}><ActivityIndicator color="#5B5CE2" /></View>;
  if (!hasSession && pathname !== '/auth') return null;
  return <Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(tabs)" /><Stack.Screen name="auth" /></Stack>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="dark" />
      <AuthGate />
    </ThemeProvider>
  );
}
