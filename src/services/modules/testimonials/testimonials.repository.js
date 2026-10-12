import { BaseRepository } from '../../../core/base.repository.js';

export class TestimonialsRepository extends BaseRepository {
  constructor() {
    super('testimonials');
  }
}

export const testimonialsRepository = new TestimonialsRepository();
