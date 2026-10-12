import { BaseRepository } from '../../../core/base.repository.js';

export class TerminalRepository extends BaseRepository {
  constructor() {
    super('terminal_config');
  }

  async getConfig() {
    const { data, error } = await this.supabase
      .from('terminal_config')
      .select('*, terminal_protected_commands(*), terminal_section_map(*)')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}

export const terminalRepository = new TerminalRepository();
