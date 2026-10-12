import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';
import { syncChildRows } from '../sync-child-rows.js';

export class SolutionsService {
  constructor() {
    this.repo = new BaseRepository('solutions');
    this.supabase = supabase;
  }

  async getAllSolutions() {
    const { data, error } = await this.supabase
      .from('solutions')
      .select('*, solution_tech(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createSolution(solutionData, techList = []) {
    const solution = await this.repo.insert(solutionData);
    await syncChildRows({
      supabase: this.supabase,
      table: 'solution_tech',
      parentColumn: 'solution_id',
      parentId: solution.id,
      nextRows: techList.map((tech) => ({ tech })),
      keyFields: ['tech'],
      createRow: (solutionId, row) => ({ solution_id: solutionId, tech: row.tech }),
    });
    return solution;
  }

  async updateSolution(id, solutionData, techList, currentTech = []) {
    const solution = await this.repo.update(id, solutionData);
    if (techList) {
      await syncChildRows({
        supabase: this.supabase,
        table: 'solution_tech',
        parentColumn: 'solution_id',
        parentId: id,
        currentRows: currentTech,
        nextRows: techList.map((tech) => ({ tech })),
        keyFields: ['tech'],
        createRow: (solutionId, row) => ({ solution_id: solutionId, tech: row.tech }),
      });
    }
    return solution;
  }

  async deleteSolution(id) {
    return this.repo.delete(id);
  }

  async reorderSolutions(orderedItems) {
    return this.repo.reorder(orderedItems);
  }
}

export const solutionsService = new SolutionsService();
