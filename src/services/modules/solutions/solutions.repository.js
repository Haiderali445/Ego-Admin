import { BaseRepository } from '../../../core/base.repository.js';

export class SolutionsRepository extends BaseRepository {
  constructor() {
    super('solutions');
  }

  async getAllWithTech() {
    const { data, error } = await this.supabase
      .from('solutions')
      .select('*, solution_tech(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const solutionsRepository = new SolutionsRepository();
