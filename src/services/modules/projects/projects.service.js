import { BaseRepository } from '../../../core/base.repository.js';
import { supabase } from '../../../core/supabase.client.js';
import { syncChildRows } from '../sync-child-rows.js';

export class ProjectsService {
  constructor() {
    this.repo = new BaseRepository('projects');
    this.supabase = supabase;
  }

  // --- READ ---
  async getAllProjects() {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*, project_tools(*), project_images(*), project_contributors(*)')
      .order('sortorder', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getProjectById(id) {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*, project_tools(*), project_images(*), project_contributors(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // --- CREATE ---
  async createProject(projectData, tools = [], imageUrls = [], contributors = []) {
    const project = await this.repo.insert(projectData);
    await this.syncChildren(project.id, [], tools, [], imageUrls, [], contributors);

    return this.getProjectById(project.id);
  }

  // --- UPDATE ---
  async updateProject(id, projectData, tools, imageUrls, contributors, currentChildren = {}) {
    const project = await this.repo.update(id, projectData);
    if (tools || imageUrls || contributors) {
      await this.syncChildren(
        id,
        currentChildren.tools ?? [], tools ?? [],
        currentChildren.images ?? [], imageUrls ?? [],
        currentChildren.contributors ?? [], contributors ?? []
      );
    }
    return project;
  }

  async syncChildren(projectId, currentTools, tools, currentImages, imageUrls, currentContributors, contributors) {
    await syncChildRows({
      supabase: this.supabase,
      table: 'project_tools',
      parentId: projectId,
      currentRows: currentTools,
      nextRows: tools.map((tool) => ({ tool })),
      keyFields: ['tool'],
      createRow: (id, row) => ({ project_id: id, tool: row.tool }),
    });
    await syncChildRows({
      supabase: this.supabase,
      table: 'project_images',
      parentId: projectId,
      currentRows: currentImages,
      nextRows: imageUrls.map((image_url) => ({ image_url })),
      keyFields: ['image_url'],
      createRow: (id, row) => ({ project_id: id, image_url: row.image_url }),
    });
    await syncChildRows({
      supabase: this.supabase,
      table: 'project_contributors',
      parentId: projectId,
      currentRows: currentContributors,
      nextRows: contributors,
      keyFields: ['name', 'github', 'profileurl'],
      createRow: (id, row) => ({
        project_id: id,
        name: row.name,
        github: row.github || '',
        profileurl: row.profileurl || '',
      }),
    });
  }

  // --- DELETE ---
  async deleteProject(id) {
    // Child tables have ON DELETE CASCADE in PostgreSQL
    return this.repo.delete(id);
  }

  // --- REORDER ---
  async reorderProjects(orderedItems) {
    return this.repo.reorder(orderedItems);
  }

  // --- CHILD TOOLS CRUD ---
  async addTool(projectId, tool) {
    const { data, error } = await this.supabase
      .from('project_tools')
      .insert([{ project_id: projectId, tool }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteTool(toolId) {
    const { error } = await this.supabase
      .from('project_tools')
      .delete()
      .eq('id', toolId);
    if (error) throw error;
    return true;
  }

  // --- CHILD IMAGES CRUD ---
  async addImage(projectId, imageUrl) {
    const { data, error } = await this.supabase
      .from('project_images')
      .insert([{ project_id: projectId, image_url: imageUrl }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteImage(imageId) {
    const { error } = await this.supabase
      .from('project_images')
      .delete()
      .eq('id', imageId);
    if (error) throw error;
    return true;
  }
}

export const projectsService = new ProjectsService();
