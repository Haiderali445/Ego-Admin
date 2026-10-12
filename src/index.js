// Core Architecture Exports
export { supabase } from './core/supabase.client.js';
export { logger } from './core/logger.js';
export { BaseRepository } from './core/base.repository.js';
export { authService, AuthService } from './core/auth/auth.service.js';

// Domain Service Modules (High-level CRUD Service layer)
export { profileService, ProfileService } from './services/modules/profile/profile.service.js';
export { projectsService, ProjectsService } from './services/modules/projects/projects.service.js';
export { experienceService, ExperienceService } from './services/modules/experience/experience.service.js';
export { educationService, EducationService } from './services/modules/education/education.service.js';
export { skillsService, SkillsService } from './services/modules/skills/skills.service.js';
export { servicesService, ServicesService } from './services/modules/services/services.service.js';
export { solutionsService, SolutionsService } from './services/modules/solutions/solutions.service.js';
export { testimonialsService, TestimonialsService } from './services/modules/testimonials/testimonials.service.js';
export { pricingService, PricingService } from './services/modules/pricing/pricing.service.js';
export { siteConfigService, SiteConfigService } from './services/modules/site-config/siteConfig.service.js';
export { terminalService, TerminalService } from './services/modules/terminal/terminal.service.js';

// Domain Repository Modules (Direct repository level)
export { profileRepository, ProfileRepository } from './services/modules/profile/profile.repository.js';
export { projectsRepository, ProjectsRepository } from './services/modules/projects/projects.repository.js';
export { experienceRepository, ExperienceRepository } from './services/modules/experience/experience.repository.js';
export { educationRepository, EducationRepository } from './services/modules/education/education.repository.js';
export { skillsRepository, SkillsRepository } from './services/modules/skills/skills.repository.js';
export { servicesRepository, ServicesRepository } from './services/modules/services/services.repository.js';
export { solutionsRepository, SolutionsRepository } from './services/modules/solutions/solutions.repository.js';
export { testimonialsRepository, TestimonialsRepository } from './services/modules/testimonials/testimonials.repository.js';
export { pricingRepository, PricingRepository } from './services/modules/pricing/pricing.repository.js';
export { siteConfigRepository, SiteConfigRepository } from './services/modules/site-config/siteConfig.repository.js';
export { terminalRepository, TerminalRepository } from './services/modules/terminal/terminal.repository.js';
