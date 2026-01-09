'use client';

export async function uploadVideo(file: File, userId: string) {
  if (typeof window === 'undefined') return '';

  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    'https://jamteamoficial.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdGZjdG9kY2RzbHdjeWplbWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MzMxOTYsImV4cCI6MjA4MzMwOTE5Nn0.kzTBVxhr5Y1bYN6gTUFU2eAhvw2VsYK0to-hoetOQfg'
  );

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
