import { BaseRepository } from '../../../core/base.repository.js';

export class ProfileRepository extends BaseRepository {
  constructor() {
    super('profile');
  }

  /**
   * Fetch full profile with child relational arrays
   */
  async getFullProfile() {
    const { data, error } = await this.supabase
      .from('profile')
      .select('*, profile_typewriter_titles(*), profile_interests(*), about_focus(*)')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Update child typewriter titles
   */
  async updateTypewriterTitles(profileId, titles) {
    await this.supabase.from('profile_typewriter_titles').delete().eq('profile_id', profileId);
    if (titles && titles.length > 0) {
      const payload = titles.map(title => ({ profile_id: profileId, title }));
      const { data, error } = await this.supabase.from('profile_typewriter_titles').insert(payload);
      if (error) throw error;
      return data;
    }
    return [];
  }

  /**
   * Update child interests
   */
  async updateInterests(profileId, interests) {
    await this.supabase.from('profile_interests').delete().eq('profile_id', profileId);
    if (interests && interests.length > 0) {
      const payload = interests.map(interest => ({ profile_id: profileId, interest }));
      const { data, error } = await this.supabase.from('profile_interests').insert(payload);
      if (error) throw error;
      return data;
    }
    return [];
  }
}

export const profileRepository = new ProfileRepository();
