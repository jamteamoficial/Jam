'use client';

export async function uploadVideo(file: File, userId: string) {
  if (typeof window === 'undefined') return '';

  const { createClient } = await import('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('videosJAM')
    .upload(`${userId}/${fileName}`, file);
    
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('videosJAM')
    .getPublicUrl(data.path);
    
  return publicUrl;
}
