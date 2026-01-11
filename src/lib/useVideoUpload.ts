'use client';

import { supabase } from '@/lib/supabase';

export async function uploadVideo(file: File, userId: string) {
  if (typeof window === 'undefined') return '';

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
  
  // Usamos el nombre exacto que vimos en tu panel de Supabase
  const { data, error } = await supabase.storage
    .from('Videos JAM') 
    .upload(`${userId}/${fileName}`, file);
    
  if (error) {
    console.error('Error en Supabase:', error.message);
    throw error;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('Videos JAM')
    .getPublicUrl(data.path);
    
  return publicUrl;
}