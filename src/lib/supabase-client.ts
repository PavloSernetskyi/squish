// lib/supabase-client.ts (browser)
import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('Supabase config:', { 
    hasUrl: !!url, 
    hasKey: !!key,
    urlLength: url?.length,
    keyLength: key?.length 
  });
  
  return createBrowserClient(url!, key!);
};