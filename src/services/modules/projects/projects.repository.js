import { BaseRepository } from '../../../core/base.repository.js';

export class ProjectsRepository extends BaseRepository {
  constructor() {
    super('projects');
  }

  /**
   * Fetch all projects ordered by sortorder with child joins
   */
  async getAllWithRelations() {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*, project_tools(*), project_images(*), project_contributors(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Sync tools for a project
   */
  async syncTools(projectId, tools) {
    await this.supabase.from('project_tools').delete().eq('project_id', projectId);
    if (tools && tools.length > 0) {
      const payload = tools.map(tool => ({ project_id: projectId, tool }));
      const { data, error } = await this.supabase.from('project_tools').insert(payload);
      if (error) throw error;
      return data;
    }
    return [];
  }

  /**
   * Sync images for a project
   */
  async syncImages(projectId, imageUrls) {
    await this.supabase.from('project_images').delete().eq('project_id', projectId);
    if (imageUrls && imageUrls.length > 0) {
      const payload = imageUrls.map(image_url => ({ project_id: projectId, image_url }));
      const { data, error } = await this.supabase.from('project_images').insert(payload);
      if (error) throw error;
      return data;
    }
    return [];
  }
}

export const projectsRepository = new ProjectsRepository();
