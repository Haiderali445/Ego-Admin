import { BaseRepository } from '../../../core/base.repository.js';

export class SiteConfigRepository extends BaseRepository {
  constructor() {
    super('site_config');
  }

  async getConfig() {
    const { data, error } = await this.supabase
      .from('site_config')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export const siteConfigRepository = new SiteConfigRepository();
