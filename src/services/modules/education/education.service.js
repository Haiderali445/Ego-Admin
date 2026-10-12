import { BaseRepository } from '../../../core/base.repository.js';

export class EducationService {
  constructor() {
    this.repo = new BaseRepository('education');
  }

  async getAllEducation() {
    return this.repo.getAll({ orderBy: 'sortorder', ascending: true });
  }

  async createEducation(eduData) {
    return this.repo.insert(eduData);
  }

  async updateEducation(id, eduData) {
    return this.repo.update(id, eduData);
  }

  async deleteEducation(id) {
    return this.repo.delete(id);
  }

  async reorderEducation(orderedItems) {
    return this.repo.reorder(orderedItems);
  }
}

export const educationService = new EducationService();
