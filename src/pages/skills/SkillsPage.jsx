import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, Select, Popconfirm, Tag, message } from 'antd';
import { Plus, Edit2, Trash2, Wrench } from 'lucide-react';
import { skillsService } from '../../services/modules/skills/skills.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

const SKILL_CATEGORIES = ['Languages', 'Frameworks', 'AI', 'Systems', 'Solutions', 'Tools'];

export const SkillsPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsService.getAllSkills(),
  });

  const createMutation = useMutation({
    mutationFn: (values) => skillsService.createSkill(values),
    onSuccess: () => {
      message.success('Skill created');
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => skillsService.updateSkill(id, values),
    onSuccess: () => {
      message.success('Skill updated');
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => skillsService.deleteSkill(id),
    onSuccess: () => {
      message.success('Skill deleted');
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
      form.setFieldsValue({ category: 'Languages', glowcolor: 'bg-blue-600' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        updateMutation.mutate({ id: editingItem.id, values });
      } else {
        createMutation.mutate(values);
      }
    } catch {
      // Form error
    }
  };

  const columns = [
    {
      title: 'Skill Name',
      dataIndex: 'name',
      key: 'name',
      render: (val) => <span className="font-semibold text-foreground text-xs">{val}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (val) => (
        <Tag className="text-[11px] font-mono bg-muted border-border text-foreground">
          {val}
        </Tag>
      ),
    },
    {
      title: 'Glow Token',
      dataIndex: 'glowcolor',
      key: 'glowcolor',
      width: 160,
      render: (val) => <span className="text-xs font-mono text-muted-foreground">{val || '—'}</span>,
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
            title="Delete skill?"
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
        title="Skills & Technical Proficiency"
        subtitle="Manage technical taxonomy, languages, systems, and categories"
        metrics={[
          <MetricTile
            key="count"
            label="Total Skills"
            value={records.length}
            icon={Wrench}
            subtext="Live skill entries"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Skill
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Skill' : 'Add Skill'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Skill"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Skill Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. TypeScript, Rust, Docker" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Category is required' }]}>
            <Select>
              {SKILL_CATEGORIES.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {cat}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="glowcolor" label="Visual Glow Token">
            <Input placeholder="e.g. bg-blue-600 or bg-indigo-500" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
