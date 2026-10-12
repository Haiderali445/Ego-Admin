import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';

export class SiteConfigService {
  constructor() {
    this.repo = new BaseRepository('site_config');
    this.supabase = supabase;
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

  async updateConfig(id, configData) {
    return this.repo.update(id, configData);
  }

  async upsertConfig(configData) {
    return this.repo.upsert(configData, 'id');
  }
}

export const siteConfigService = new SiteConfigService();
