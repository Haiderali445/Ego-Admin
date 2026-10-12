import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';

export class SkillsService {
  constructor() {
    this.repo = new BaseRepository('skills');
    this.supabase = supabase;
  }

  async getAllSkills() {
    return this.repo.getAll();
  }

  async createSkill(skillData) {
    return this.repo.insert(skillData);
  }

  async updateSkill(id, skillData) {
    return this.repo.update(id, skillData);
  }

  async deleteSkill(id) {
    return this.repo.delete(id);
  }

  async getCategories() {
    const { data, error } = await this.supabase
      .from('skill_categories')
      .select('*, skill_category_items(*)');
    if (error) throw error;
    return data || [];
  }
}

export const skillsService = new SkillsService();
