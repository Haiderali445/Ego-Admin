import { BaseRepository } from '../../../core/base.repository.js';

export class PricingRepository extends BaseRepository {
  constructor() {
    super('pricing');
  }

  async getAllOrdered() {
    return this.getAll({ orderBy: 'sortorder', ascending: true });
  }
}

export const pricingRepository = new PricingRepository();
