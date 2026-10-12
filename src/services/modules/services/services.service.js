import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';
import { syncChildRows } from '../sync-child-rows.js';

export class ServicesService {
  constructor() {
    this.repo = new BaseRepository('services');
    this.supabase = supabase;
  }

  async getAllServices() {
    const { data, error } = await this.supabase
      .from('services')
      .select('*, service_full_tech_stack(*), service_implementation_steps(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async createService(serviceData, stack = [], steps = []) {
    const service = await this.repo.insert(serviceData);
    await this.syncChildren(service.id, [], stack, [], steps);

    return service;
  }

  async updateService(id, serviceData, stack, steps, currentStack = [], currentSteps = []) {
    const service = await this.repo.update(id, serviceData);
    if (stack || steps) {
      await this.syncChildren(id, currentStack, stack, currentSteps, steps);
    }
    return service;
  }

  async syncChildren(serviceId, currentStack = [], stack = [], currentSteps = [], steps = []) {
    await syncChildRows({
      supabase: this.supabase,
      table: 'service_full_tech_stack',
      parentColumn: 'service_id',
      parentId: serviceId,
      currentRows: currentStack,
      nextRows: stack.map((tech) => ({ tech })),
      keyFields: ['tech'],
      createRow: (id, row) => ({ service_id: id, tech: row.tech }),
    });
    await syncChildRows({
      supabase: this.supabase,
      table: 'service_implementation_steps',
      parentColumn: 'service_id',
      parentId: serviceId,
      currentRows: currentSteps,
      nextRows: steps,
      keyFields: ['title', 'description'],
      createRow: (id, row) => ({ service_id: id, title: row.title, description: row.description }),
    });
  }

  async deleteService(id) {
    return this.repo.delete(id);
  }

  async reorderServices(orderedItems) {
    return this.repo.reorder(orderedItems);
  }
}

export const servicesService = new ServicesService();
