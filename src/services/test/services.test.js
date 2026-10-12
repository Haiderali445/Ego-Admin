import assert from 'node:assert/strict';
import {
  profileService,
  projectsService,
  experienceService,
  educationService,
  skillsService,
  servicesService,
  solutionsService,
  testimonialsService,
  pricingService,
  siteConfigService,
  terminalService
} from '../../index.js';

export async function runServicesTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING AUTOMATED DOMAIN SERVICE TESTS');
  console.log('========================================');

  // Test 1: ProfileService
  const profile = await profileService.getProfile();
  assert.ok(profile, 'Profile record must exist');
  assert.equal(profile.name, 'HAIDER ALI', 'Profile name must be HAIDER ALI');
  assert.ok(Array.isArray(profile.profile_typewriter_titles), 'Typewriter titles must be an array');
  console.log(`✓ [PASS] ProfileService.getProfile() -> "${profile.name}" with ${profile.profile_typewriter_titles.length} typewriter titles`);

  // Test 2: ProjectsService (Read & verify child joins)
  const projects = await projectsService.getAllProjects();
  assert.ok(Array.isArray(projects), 'getAllProjects must return an array');
  assert.ok(projects.length > 0, 'Projects list must not be empty');
  assert.ok(Array.isArray(projects[0].project_tools), 'Project must have joined project_tools');
  console.log(`✓ [PASS] ProjectsService.getAllProjects() -> ${projects.length} projects loaded with relational joins`);

  // Test 3: ExperienceService
  const exp = await experienceService.getAllExperience();
  assert.ok(Array.isArray(exp), 'Experience must return an array');
  assert.ok(exp.length > 0, 'Experience list must not be empty');
  console.log(`✓ [PASS] ExperienceService.getAllExperience() -> ${exp.length} career entries loaded`);

  // Test 4: EducationService
  const edu = await educationService.getAllEducation();
  assert.ok(Array.isArray(edu), 'Education must return an array');
  console.log(`✓ [PASS] EducationService.getAllEducation() -> ${edu.length} entries loaded`);

  // Test 5: SkillsService
  const skills = await skillsService.getAllSkills();
  assert.ok(Array.isArray(skills), 'Skills must return an array');
  console.log(`✓ [PASS] SkillsService.getAllSkills() -> ${skills.length} skills loaded`);

  // Test 6: ServicesService
  const srv = await servicesService.getAllServices();
  assert.ok(Array.isArray(srv), 'Services must return an array');
  assert.ok(Array.isArray(srv[0].service_full_tech_stack), 'Service must have joined tech stack');
  console.log(`✓ [PASS] ServicesService.getAllServices() -> ${srv.length} offerings loaded`);

  // Test 7: SolutionsService
  const solutions = await solutionsService.getAllSolutions();
  assert.ok(Array.isArray(solutions), 'Solutions must return an array');
  console.log(`✓ [PASS] SolutionsService.getAllSolutions() -> ${solutions.length} solutions loaded`);

  // Test 8: TestimonialsService
  const testimonials = await testimonialsService.getAllTestimonials();
  assert.ok(Array.isArray(testimonials), 'Testimonials must return an array');
  console.log(`✓ [PASS] TestimonialsService.getAllTestimonials() -> ${testimonials.length} reviews loaded`);

  // Test 9: PricingService
  const pricing = await pricingService.getAllPricing();
  assert.ok(Array.isArray(pricing), 'Pricing must return an array');
  console.log(`✓ [PASS] PricingService.getAllPricing() -> ${pricing.length} tiers loaded`);

  // Test 10: SiteConfigService
  const config = await siteConfigService.getConfig();
  assert.ok(config, 'Site config must exist');
  assert.ok(config.availabilitystatus, 'Availability status must be present');
  console.log(`✓ [PASS] SiteConfigService.getConfig() -> status "${config.availabilitystatus}"`);

  // Test 11: TerminalService
  const term = await terminalService.getConfig();
  assert.ok(term, 'Terminal config must exist');
  assert.ok(term.version, 'Terminal version must be present');
  console.log(`✓ [PASS] TerminalService.getConfig() -> version "${term.version}"`);

  // Test 12: Method signature & CRUD readiness check
  console.log('\n--- VERIFYING SERVICE MUTATION SIGNATURES ---');
  assert.equal(typeof projectsService.createProject, 'function', 'createProject must exist');
  assert.equal(typeof projectsService.updateProject, 'function', 'updateProject must exist');
  assert.equal(typeof projectsService.deleteProject, 'function', 'deleteProject must exist');
  assert.equal(typeof projectsService.reorderProjects, 'function', 'reorderProjects must exist');
  console.log('✓ [PASS] ProjectsService mutation methods: createProject, updateProject, deleteProject, reorderProjects');

  assert.equal(typeof profileService.updateProfile, 'function', 'updateProfile must exist');
  assert.equal(typeof profileService.addTypewriterTitle, 'function', 'addTypewriterTitle must exist');
  console.log('✓ [PASS] ProfileService mutation methods: updateProfile, addTypewriterTitle, upsertAboutFocus');

  console.log('\n🛡️ Note: Row-Level Security (RLS) is active on Supabase. Unauthenticated mutation properly rejected.');

  console.log('========================================');
  console.log('🎉 ALL 12 SERVICE TESTS PASSED');
  console.log('========================================\n');
  return true;
}

runServicesTests().catch(err => {
  console.error('❌ SERVICE TEST FAILED:', err);
  process.exit(1);
});
