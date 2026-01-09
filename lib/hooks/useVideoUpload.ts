'use client';

import { supabase } from '@/lib/supabaseClient';

export async function uploadVideo(file: File, userId: string) {
  // Nombre único: timestamp + UUID + extensión
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  
  // Upload a bucket videosJAM
  const { data, error } = await supabase.storage
    .from('videosJAM')
    .upload(`${userId}/${fileName}`, file, {
      cacheControl: '3600',  // Cache 1h
      upsert: false
    });
    
  if (error) {
    console.error('Upload error:', error);
    throw error;
  }
  
  // URL pública para <video>
  const { data: { publicUrl } } = supabase.storage
    .from('videosJAM')
    .getPublicUrl(data.path);
    
  console.log('Video subido:', publicUrl);
  return publicUrl;
}
