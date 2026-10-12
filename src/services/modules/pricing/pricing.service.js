import { BaseRepository } from '../../../core/base.repository.js';

export class PricingService {
  constructor() {
    this.repo = new BaseRepository('pricing');
  }

  async getAllPricing() {
    return this.repo.getAll({ orderBy: 'sortorder', ascending: true });
  }

  async createPricing(pricingData) {
    return this.repo.insert(pricingData);
  }

  async updatePricing(id, pricingData) {
    return this.repo.update(id, pricingData);
  }

  async deletePricing(id) {
    return this.repo.delete(id);
  }

  async reorderPricing(orderedItems) {
    return this.repo.reorder(orderedItems);
  }
}

export const pricingService = new PricingService();
