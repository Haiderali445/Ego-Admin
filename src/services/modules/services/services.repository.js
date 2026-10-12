import { BaseRepository } from '../../../core/base.repository.js';

export class ServicesRepository extends BaseRepository {
  constructor() {
    super('services');
  }

  async getAllWithDetails() {
    const { data, error } = await this.supabase
      .from('services')
      .select('*, service_full_tech_stack(*), service_implementation_steps(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }
}

export const servicesRepository = new ServicesRepository();
