'use client';

export async function uploadVideo(file: File, userId: string) {
  if (typeof window === 'undefined') return '';

  // Usar el cliente centralizado de Supabase
  const { supabase } = await import('@/lib/supabase');

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
