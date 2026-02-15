import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface CandidateProfile {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  bio?: string;
  email?: string;
  skills: string[];
  location?: string;
  match_score?: number;
  [key: string]: any; // Allow other properties from raw_data
}

interface RpcResponseItem {
  id: string;
  source_type: string;
  similarity: number;
  raw_data: {
    name: string;
    login?: string; // GitHub often uses 'login' instead of 'username'
    username?: string;
    avatar_url: string;
    bio?: string;
    email?: string;
    location?: string;
    [key: string]: any;
  };
}

/**
 * Fetches top 3 matching profiles based on a full-text search query.
 * 
 * NOTE: The `embedding` parameter is required by the RPC signature but is 
 * currently IGNORED by the backend SQL function in favor of `ts_rank` text search.
 * We pass a dummy zero-vector to satisfy the contract.
 */
export async function fetchProfiles(queryText: string) {
  // Dummy vector to satisfy the RPC signature (1536 dims is standard for OpenAI, matching the definition)
  const dummyEmbedding = new Array(1536).fill(0);

  const { data, error } = await supabase.rpc('search_github_profiles', {
    query_embedding: dummyEmbedding, 
    query_text: queryText,
    match_threshold: 0.5,
    match_count: 3,
  });

  if (error) {
    console.error('Supabase search error:', error);
    throw error;
  }

  if (!data) return [];

  // Map the RPC response (which wraps profile data in `raw_data`) to our flat CandidateProfile interface
  return (data as RpcResponseItem[]).map((item) => {
    const raw = item.raw_data || {};
    return {
      ...raw, // Spread other raw fields first
      id: item.id,
      name: raw.name || raw.login || 'Unknown',
      username: raw.login || raw.username || 'unknown', // Handle GitHub 'login' field
      avatar_url: raw.avatar_url,
      bio: raw.bio,
      email: raw.email,
      location: raw.location,
      skills: [], 
      match_score: item.similarity,
    } as CandidateProfile;
  });
}

export interface Interaction {
  type: 'view_profile' | 'hire' | 'show_results';
  timezone: string;
  timestamp: string;
  candidateId?: string;
  candidateName?: string;
}

export interface SearchRecord {
  id: string;
  user_email: string;
  original_query: string;
  custom_title: string;
  ai_plan: string;
  result_ids: string[];
  interactions: Interaction[];
  total_scanned: number;
  parent_id?: string;
  created_at?: string;
}

export const generateScannedCount = () => Math.floor(Math.random() * (9800 - 7000 + 1)) + 7000;

export async function saveSearch(record: Omit<SearchRecord, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('user_searches')
    .insert([{
      ...record,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    }])
    .select()
    .single();

  if (error) {
    console.error('Error saving search:', error);
    throw error;
  }
  return data as SearchRecord;
}

export async function logInteraction(searchId: string, interaction: Interaction) {
  // First get current interactions
  const { data: search, error: fetchError } = await supabase
    .from('user_searches')
    .select('interactions')
    .eq('id', searchId)
    .single();

  if (fetchError) {
    console.error('Error fetching interactions:', fetchError);
    return;
  }

  const existingInteractions = search?.interactions || [];
  const updatedInteractions = [...existingInteractions, interaction];

  const { error: updateError } = await supabase
    .from('user_searches')
    .update({ interactions: updatedInteractions })
    .eq('id', searchId);

  if (updateError) {
    console.error('Error logging interaction:', updateError);
  }
}

export async function fetchHistory(email: string) {
  const { data, error } = await supabase
    .from('user_searches')
    .select('*')
    .eq('user_email', email)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching history:', error);
    return [];
  }

  return data as SearchRecord[];
}
