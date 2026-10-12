import { BaseRepository } from '../../../core/base.repository.js';

export class EducationRepository extends BaseRepository {
  constructor() {
    super('education');
  }

  async getAllOrdered() {
    return this.getAll({ orderBy: 'sortorder', ascending: true });
  }
}

export const educationRepository = new EducationRepository();
