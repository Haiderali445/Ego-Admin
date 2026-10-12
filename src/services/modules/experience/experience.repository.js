import { BaseRepository } from '../../../core/base.repository.js';

export class ExperienceRepository extends BaseRepository {
  constructor() {
    super('experience');
  }

  async getAllWithTech() {
    const { data, error } = await this.supabase
      .from('experience')
      .select('*, experience_tech(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async syncTech(experienceId, techList) {
    await this.supabase.from('experience_tech').delete().eq('experience_id', experienceId);
    if (techList && techList.length > 0) {
      const payload = techList.map(tech => ({ experience_id: experienceId, tech }));
      const { data, error } = await this.supabase.from('experience_tech').insert(payload);
      if (error) throw error;
      return data;
    }
    return [];
  }
}

export const experienceRepository = new ExperienceRepository();
