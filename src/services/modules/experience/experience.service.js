import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';
import { syncChildRows } from '../sync-child-rows.js';

export class ExperienceService {
  constructor() {
    this.repo = new BaseRepository('experience');
    this.supabase = supabase;
  }

  async getAllExperience() {
    const { data, error } = await this.supabase
      .from('experience')
      .select('*, experience_tech(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createExperience(expData, techList = []) {
    const exp = await this.repo.insert(expData);
    await syncChildRows({
      supabase: this.supabase,
      table: 'experience_tech',
      parentColumn: 'experience_id',
      parentId: exp.id,
      nextRows: techList.map((tech) => ({ tech })),
      keyFields: ['tech'],
      createRow: (experienceId, row) => ({ experience_id: experienceId, tech: row.tech }),
    });
    return exp;
  }

  async updateExperience(id, expData, techList, currentTech = []) {
    const exp = await this.repo.update(id, expData);
    if (techList) {
      await syncChildRows({
        supabase: this.supabase,
        table: 'experience_tech',
        parentColumn: 'experience_id',
        parentId: id,
        currentRows: currentTech,
        nextRows: techList.map((tech) => ({ tech })),
        keyFields: ['tech'],
        createRow: (experienceId, row) => ({ experience_id: experienceId, tech: row.tech }),
      });
    }
    return exp;
  }

  async deleteExperience(id) {
    return this.repo.delete(id);
  }

  async reorderExperience(orderedItems) {
    return this.repo.reorder(orderedItems);
  }

  async addTech(experienceId, tech) {
    const { data, error } = await this.supabase
      .from('experience_tech')
      .insert([{ experience_id: experienceId, tech }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteTech(techId) {
    const { error } = await this.supabase
      .from('experience_tech')
      .delete()
      .eq('id', techId);
    if (error) throw error;
    return true;
  }
}

export const experienceService = new ExperienceService();
