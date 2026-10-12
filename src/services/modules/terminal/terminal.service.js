import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';

export class TerminalService {
  constructor() {
    this.repo = new BaseRepository('terminal_config');
    this.supabase = supabase;
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

  async updateConfig(id, configData) {
    return this.repo.update(id, configData);
  }

  async setProtectedCommands(terminalConfigId, commands) {
    await this.supabase.from('terminal_protected_commands').delete().eq('terminal_config_id', terminalConfigId);
    if (commands.length > 0) {
      const payload = commands.map(cmd => ({ terminal_config_id: terminalConfigId, command: cmd }));
      const { data, error } = await this.supabase.from('terminal_protected_commands').insert(payload);
      if (error) throw error;
      return data;
    }
    return [];
  }
}

export const terminalService = new TerminalService();
