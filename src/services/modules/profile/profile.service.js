import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';

export class ProfileService {
  constructor() {
    this.repo = new BaseRepository('profile');
    this.supabase = supabase;
  }

  // --- READ ---
  async getProfile() {
    const { data, error } = await this.supabase
      .from('profile')
      .select('*, profile_typewriter_titles(*), profile_interests(*), about_focus(*)')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // --- UPDATE PROFILE ---
  async updateProfile(id, payload) {
    return this.repo.update(id, payload);
  }

  // --- TYPEWRITER TITLES CRUD ---
  async addTypewriterTitle(profileId, title) {
    const { data, error } = await this.supabase
      .from('profile_typewriter_titles')
      .insert([{ profile_id: profileId, title }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteTypewriterTitle(titleId) {
    const { error } = await this.supabase
      .from('profile_typewriter_titles')
      .delete()
      .eq('id', titleId);
    if (error) throw error;
    return true;
  }

  // --- INTERESTS CRUD ---
  async addInterest(profileId, interest) {
    const { data, error } = await this.supabase
      .from('profile_interests')
      .insert([{ profile_id: profileId, interest }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteInterest(interestId) {
    const { error } = await this.supabase
      .from('profile_interests')
      .delete()
      .eq('id', interestId);
    if (error) throw error;
    return true;
  }

  // --- ABOUT FOCUS CRUD ---
  async upsertAboutFocus(payload) {
    const { data, error } = await this.supabase
      .from('about_focus')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteAboutFocus(focusId) {
    const { error } = await this.supabase
      .from('about_focus')
      .delete()
      .eq('id', focusId);
    if (error) throw error;
    return true;
  }
}

export const profileService = new ProfileService();
