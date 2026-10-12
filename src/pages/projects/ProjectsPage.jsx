import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, InputNumber, Switch, Popconfirm, Tag, message } from 'antd';
import { Plus, Edit2, Trash2, FolderGit2 } from 'lucide-react';
import { projectsService } from '../../services/modules/projects/projects.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const ProjectsPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsService.getAllProjects(),
  });
  const imageUrlsText = Form.useWatch('imageUrlsString', form);
  const firstImageUrl = imageUrlsText?.split(/[\n,]/).map((url) => url.trim()).find(Boolean);

  const createMutation = useMutation({
    mutationFn: ({ data, tools, imageUrls, contributors }) =>
      projectsService.createProject(data, tools, imageUrls, contributors),
    onSuccess: () => {
      message.success('Project created successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, tools, imageUrls, contributors, currentChildren }) =>
      projectsService.updateProject(id, data, tools, imageUrls, contributors, currentChildren),
    onSuccess: () => {
      message.success('Project updated');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectsService.deleteProject(id),
    onSuccess: () => {
      message.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        toolsString: (item.project_tools ?? []).map((row) => row.tool).join(', '),
        imageUrlsString: (item.project_images ?? []).map((row) => row.image_url).join('\n'),
        contributors: (item.project_contributors ?? []).map((row) => ({
          name: row.name,
          github: row.github,
          profileurl: row.profileurl ?? row.profileUrl ?? '',
        })),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ inprogress: false, contributors: [] });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const toolsList = values.toolsString
        ? values.toolsString.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
        : [];
      const imageUrls = values.imageUrlsString
        ? values.imageUrlsString.split(/[\n,]/).map((url) => url.trim()).filter(Boolean)
        : [];
      const contributors = (values.contributors ?? [])
        .map((row) => ({
          name: row?.name?.trim(),
          github: row?.github?.trim() || '',
          profileurl: row?.profileurl?.trim() || '',
        }))
        .filter((row) => row.name);

      const payload = {
        name: values.name,
        description: values.description,
        role: values.role,
        code: values.code,
        demo: values.demo,
        websiteurl: values.websiteurl,
        inprogress: values.inprogress,
        sortorder: values.sortorder,
      };

      if (editingItem) {
        updateMutation.mutate({
          id: editingItem.id,
          data: payload,
          tools: toolsList,
          imageUrls,
          contributors,
          currentChildren: {
            tools: editingItem.project_tools ?? [],
            images: editingItem.project_images ?? [],
            contributors: editingItem.project_contributors ?? [],
          },
        });
      } else {
        createMutation.mutate({ data: payload, tools: toolsList, imageUrls, contributors });
      }
    } catch {
      // validation error
    }
  };

  const columns = [
    {
      title: 'Order',
      dataIndex: 'sortorder',
      key: 'sortorder',
      width: 70,
      render: (val) => <span className="font-mono text-xs">{val ?? '—'}</span>,
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (val, record) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-xs">{val}</span>
            {record.inprogress && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                WIP
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{record.description}</p>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (val) => <span className="text-xs text-muted-foreground">{val || '—'}</span>,
    },
    {
      title: 'Gallery',
      dataIndex: 'project_images',
      key: 'project_images',
      width: 90,
      render: (images = []) => {
        const imageUrl = images[0]?.image_url;
        return imageUrl ? (
          <img src={imageUrl} alt="Project preview" className="h-10 w-16 rounded border border-border object-cover" />
        ) : <span className="text-xs text-muted-foreground">No image</span>;
      },
    },
    {
      title: 'Tools (Child Relational)',
      dataIndex: 'project_tools',
      key: 'project_tools',
      render: (toolItems) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {toolItems?.map((t, idx) => (
            <Tag key={idx} className="text-[10px] m-0 bg-muted border-border text-foreground">
              {typeof t === 'string' ? t : t.tool}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            type="text"
            size="small"
            disabled={!is2FAVerified}
            icon={<Edit2 className="w-3.5 h-3.5 text-blue-400" />}
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Delete project?"
            description="Child tools and images will also be removed."
            disabled={!is2FAVerified}
            onConfirm={() => deleteMutation.mutate(record.id)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button
              type="text"
              size="small"
              danger
              disabled={!is2FAVerified}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Projects & Works"
        subtitle="Manage portfolio showcase projects and child technologies"
        metrics={[
          <MetricTile
            key="count"
            label="Total Projects"
            value={records.length}
            icon={FolderGit2}
            subtext="Live portfolio records"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Project
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Project' : 'Add Project'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Project"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Project Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Ego Cloud Architecture" />
          </Form.Item>
          <Form.Item name="role" label="Engineering Role">
            <Input placeholder="e.g. Lead Architect / Full-Stack" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
            <Input.TextArea rows={3} placeholder="Technical breakdown and accomplishments..." />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="code" label="Source Repo URL">
              <Input placeholder="https://github.com/..." />
            </Form.Item>
            <Form.Item name="demo" label="Live Demo URL">
              <Input placeholder="https://..." />
            </Form.Item>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Form.Item name="sortorder" label="Sort Order">
              <InputNumber className="w-full" min={0} />
            </Form.Item>
            <Form.Item name="inprogress" label="Work In Progress" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
          <Form.Item name="toolsString" label="Tools / Tech Stack (comma or newline separated)">
            <Input.TextArea rows={2} placeholder="React, Node.js, GraphQL, PostgreSQL" />
          </Form.Item>
          <Form.Item name="imageUrlsString" label="Gallery Image URLs (one per line)">
            <Input.TextArea rows={3} placeholder="https://cdn.example.com/project-cover.webp" />
          </Form.Item>
          {firstImageUrl && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Gallery preview</p>
              <img src={firstImageUrl} alt="Project gallery preview" className="h-32 w-full max-w-sm rounded-md border border-border object-cover" />
            </div>
          )}
          <Form.List name="contributors">
            {(fields, { add, remove }) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Contributors</span>
                  <Button size="small" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => add({ name: '', github: '', profileurl: '' })}>
                    Add Contributor
                  </Button>
                </div>
                {fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-1 gap-2 rounded-md border border-border p-3 sm:grid-cols-2">
                    <Form.Item name={[field.name, 'name']} label="Name" className="mb-0">
                      <Input placeholder="Contributor name" />
                    </Form.Item>
                    <Form.Item name={[field.name, 'github']} label="GitHub username" className="mb-0">
                      <Input placeholder="username" />
                    </Form.Item>
                    <Form.Item name={[field.name, 'profileurl']} label="Profile URL" className="mb-0 sm:col-span-2">
                      <Input placeholder="https://github.com/username" />
                    </Form.Item>
                    <Button className="sm:col-span-2" type="text" danger icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(field.name)}>
                      Remove Contributor
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
};
