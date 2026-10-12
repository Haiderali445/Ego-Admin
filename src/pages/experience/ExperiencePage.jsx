import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, InputNumber, Popconfirm, Switch, Tag, message } from 'antd';
import { Plus, Edit2, Trash2, Briefcase } from 'lucide-react';
import { experienceService } from '../../services/modules/experience/experience.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

const isCurrentExperience = (item) =>
  Boolean(item?.is_current ?? item?.isCurrent ?? /present\s*$/i.test(item?.duration || ''));

const getDurationInputValue = (item) => {
  const duration = item?.duration || '';
  return isCurrentExperience(item)
    ? duration.replace(/\s*(?:-|–|to)\s*present\s*$/i, '').trim()
    : duration;
};

export const ExperiencePage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['experience'],
    queryFn: () => experienceService.getAllExperience(),
  });

  const createMutation = useMutation({
    mutationFn: ({ data, tech }) => experienceService.createExperience(data, tech),
    onSuccess: () => {
      message.success('Experience entry created');
      queryClient.invalidateQueries({ queryKey: ['experience'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, tech, currentTech }) =>
      experienceService.updateExperience(id, data, tech, currentTech),
    onSuccess: () => {
      message.success('Experience entry updated');
      queryClient.invalidateQueries({ queryKey: ['experience'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => experienceService.deleteExperience(id),
    onSuccess: () => {
      message.success('Experience entry deleted');
      queryClient.invalidateQueries({ queryKey: ['experience'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        duration: getDurationInputValue(item),
        is_current: isCurrentExperience(item),
        techString: (item.experience_tech ?? item.tech ?? []).map((t) => (typeof t === 'string' ? t : t.tech)).join(', ') || '',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ is_current: false });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const techList = values.techString
        ? values.techString.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: values.title,
        company: values.company,
        duration: values.duration,
        is_current: Boolean(values.is_current),
        description: values.description,
        company_url: values.company_url,
        sortorder: values.sortorder,
      };

      if (editingItem) {
        updateMutation.mutate({
          id: editingItem.id,
          data: payload,
          tech: techList,
          currentTech: editingItem.experience_tech ?? [],
        });
      } else {
        createMutation.mutate({ data: payload, tech: techList });
      }
    } catch {
      // Form error
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
      title: 'Role & Title',
      dataIndex: 'title',
      key: 'title',
      render: (val, record) => (
        <div>
          <p className="font-semibold text-foreground text-xs">{val}</p>
          <p className="text-[11px] text-muted-foreground">{record.company}</p>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (val, record) => (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-mono">{val || '—'}</span>
          {isCurrentExperience(record) && <Tag color="cyan" className="m-0 text-[10px]">CURRENT</Tag>}
        </div>
      ),
    },
    {
      title: 'Tech Stack (Child Relation)',
      dataIndex: 'experience_tech',
      key: 'experience_tech',
      render: (techItems) => (
        <div className="flex flex-wrap gap-1 max-w-sm">
          {techItems?.map((t, idx) => (
            <Tag key={idx} className="text-[10px] m-0 bg-muted border-border text-foreground">
              {typeof t === 'string' ? t : t.tech}
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
            title="Delete this role?"
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
        title="Experience Timeline"
        subtitle="Manage professional career history and associated technology tags"
        metrics={[
          <MetricTile
            key="count"
            label="Career Positions"
            value={records.length}
            icon={Briefcase}
            subtext="Live timeline entries"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Role
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Career Role' : 'Add Career Role'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Entry"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Job Title / Role" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="e.g. Lead Systems Architect" />
          </Form.Item>
          <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Company is required' }]}>
            <Input placeholder="e.g. Google / Microsoft" />
          </Form.Item>
          <Form.Item name="duration" label="Date / Range" rules={[{ required: true, message: 'A date or range is required' }]}>
            <Input placeholder="e.g. Oct 2026 or Jul 2026 - Oct 2026" />
          </Form.Item>
          <Form.Item name="is_current" label="Current Role" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="company_url" label="Company URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="sortorder" label="Sort Order">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Key achievements and engineering scope..." />
          </Form.Item>
          <Form.Item name="techString" label="Tech Tags (comma or newline separated)">
            <Input.TextArea rows={2} placeholder="React, Node.js, PostgreSQL, Docker" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
