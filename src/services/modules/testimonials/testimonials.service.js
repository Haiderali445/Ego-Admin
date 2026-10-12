import { BaseRepository } from '../../../core/base.repository.js';

export class TestimonialsService {
  constructor() {
    this.repo = new BaseRepository('testimonials');
  }

  async getAllTestimonials() {
    return this.repo.getAll();
  }

  async createTestimonial(testimonialData) {
    return this.repo.insert(testimonialData);
  }

  async updateTestimonial(id, testimonialData) {
    return this.repo.update(id, testimonialData);
  }

  async deleteTestimonial(id) {
    return this.repo.delete(id);
  }
}

export const testimonialsService = new TestimonialsService();
