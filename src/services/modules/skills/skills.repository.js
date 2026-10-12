import { BaseRepository } from '../../../core/base.repository.js';

export class SkillsRepository extends BaseRepository {
  constructor() {
    super('skills');
  }

  async getCategoriesWithItems() {
    const { data, error } = await this.supabase
      .from('skill_categories')
      .select('*, skill_category_items(*)');

    if (error) throw error;
    return data || [];
  }
}

export const skillsRepository = new SkillsRepository();
