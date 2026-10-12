import { supabase } from './supabase.client.js';
import { logger } from './logger.js';
import { authService } from './auth/auth.service.js';

/**
 * BaseRepository
 * Direct Supabase CRUD repository engine.
 * 
 * - GETTERS: Public/direct read access without requiring authentication.
 * - MUTATIONS (insert, update, upsert, delete, reorder):
 *   Protected by authService.assertMutationAuthorized() requiring
 *   an active Supabase GoTrue JWT session and verified 2FA.
 */
export class BaseRepository {
  constructor(table) {
    this.table = table;
    this.supabase = supabase;
    this.auth = authService;
  }

  // ==========================================
  // GETTERS (Open for Read Operations)
  // ==========================================

  /**
   * Fetch all records with optional filtering and ordering
   */
  async getAll(options = {}) {
    const start = performance.now();
    try {
      let query = this.supabase.from(this.table).select('*');

      if (options.filters && typeof options.filters === 'object') {
        Object.entries(options.filters).forEach(([col, val]) => {
          query = query.eq(col, val);
        });
      }

      if (options.orderBy) {
        query = query.order(options.orderBy, { ascending: options.ascending ?? true });
      }

      const { data, error } = await query;
      if (error) throw error;

      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('GET', `/${this.table}`, 200, duration);
      return data || [];
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('GET', `/${this.table}`, 500, duration);
      logger.error(this.table, `Failed to fetch records from ${this.table}`, error);
      throw error;
    }
  }

  /**
   * Fetch a single record by primary key ID
   */
  async getById(id) {
    const start = performance.now();
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('GET', `/${this.table}/${id}`, 200, duration);
      return data;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('GET', `/${this.table}/${id}`, 500, duration);
      logger.error(this.table, `Failed to get record ${id} from ${this.table}`, error);
      throw error;
    }
  }

  // ==========================================
  // MUTATIONS (Protected by Auth & 2FA Guard)
  // ==========================================

  /**
   * Insert a new record
   */
  async insert(payload) {
    await this.auth.assertMutationAuthorized();
    const start = performance.now();
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .insert([payload])
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error(`Insert into ${this.table} returned no row. Check the insert and select RLS policies.`);
      }
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('POST', `/${this.table}`, 201, duration);
      return data;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('POST', `/${this.table}`, 500, duration);
      logger.error(this.table, `Failed to insert in ${this.table}`, error);
      throw error;
    }
  }

  /**
   * Update an existing record by ID
   */
  async update(id, payload) {
    await this.auth.assertMutationAuthorized();
    const start = performance.now();
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .update(payload)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error(`No ${this.table} record was updated. It may not exist or the update RLS policy denied access.`);
      }
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('PUT', `/${this.table}/${id}`, 200, duration);
      return data;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('PUT', `/${this.table}/${id}`, 500, duration);
      logger.error(this.table, `Failed to update record ${id} in ${this.table}`, error);
      throw error;
    }
  }

  /**
   * Upsert a record
   */
  async upsert(payload, onConflict = 'id') {
    await this.auth.assertMutationAuthorized();
    const start = performance.now();
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .upsert(payload, { onConflict })
        .select()
        .single();

      if (error) throw error;
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('POST', `/${this.table}/upsert`, 200, duration);
      return data;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('POST', `/${this.table}/upsert`, 500, duration);
      logger.error(this.table, `Failed to upsert in ${this.table}`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id) {
    await this.auth.assertMutationAuthorized();
    const start = performance.now();
    try {
      const { data, error } = await this.supabase
        .from(this.table)
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        throw new Error(`No ${this.table} record was deleted. It may not exist or the delete RLS policy denied access.`);
      }
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('DELETE', `/${this.table}/${id}`, 204, duration);
      return true;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('DELETE', `/${this.table}/${id}`, 500, duration);
      logger.error(this.table, `Failed to delete record ${id} from ${this.table}`, error);
      throw error;
    }
  }

  /**
   * Batch reorder records by sortorder field
   */
  async reorder(itemsWithOrder) {
    await this.auth.assertMutationAuthorized();
    const start = performance.now();
    try {
      const updates = itemsWithOrder.map(item =>
        this.supabase
          .from(this.table)
          .update({ sortorder: item.sortorder })
          .eq('id', item.id)
      );

      const results = await Promise.all(updates);
      const failed = results.find(r => r.error);
      if (failed) throw failed.error;

      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('PATCH', `/${this.table}/reorder`, 200, duration);
      return true;
    } catch (error) {
      const duration = (performance.now() - start).toFixed(2);
      logger.morgan('PATCH', `/${this.table}/reorder`, 500, duration);
      logger.error(this.table, `Failed to reorder ${this.table}`, error);
      throw error;
    }
  }
}
