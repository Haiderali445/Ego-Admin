import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, InputNumber, Popconfirm, message } from 'antd';
import { Plus, Edit2, Trash2, GraduationCap } from 'lucide-react';
import { educationService } from '../../services/modules/education/education.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const EducationPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // TanStack Query for server state
  const { data: records = [], isLoading } = useQuery({
    queryKey: ['education'],
    queryFn: () => educationService.getAllEducation(),
  });

  // TanStack Mutations
  const createMutation = useMutation({
    mutationFn: (values) => educationService.createEducation(values),
    onSuccess: () => {
      message.success('Education record created successfully');
      queryClient.invalidateQueries({ queryKey: ['education'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => educationService.updateEducation(id, values),
    onSuccess: () => {
      message.success('Education record updated');
      queryClient.invalidateQueries({ queryKey: ['education'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => educationService.deleteEducation(id),
    onSuccess: () => {
      message.success('Education record deleted');
      queryClient.invalidateQueries({ queryKey: ['education'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
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
      // Form validation error
    }
  };

  const columns = [
    {
      title: 'Sort Order',
      dataIndex: 'sortorder',
      key: 'sortorder',
      width: 100,
      render: (val) => <span className="font-mono text-xs">{val ?? '—'}</span>,
    },
    {
      title: 'Degree / Title',
      dataIndex: 'title',
      key: 'title',
      render: (val) => <span className="font-semibold text-foreground text-xs">{val}</span>,
    },
    {
      title: 'Institution',
      dataIndex: 'institution',
      key: 'institution',
      render: (val) => <span className="text-xs text-muted-foreground">{val}</span>,
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (val) => <span className="text-xs font-mono">{val}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            type="text"
            size="small"
            disabled={!is2FAVerified}
            icon={<Edit2 className="w-3.5 h-3.5 text-blue-400" />}
            onClick={() => handleOpenModal(record)}
            aria-label="Edit record"
          />
          <Popconfirm
            title="Delete this record?"
            description="This action cannot be undone."
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
              aria-label="Delete record"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Education Credentials"
        subtitle="Manage academic qualifications and degrees"
        metrics={[
          <MetricTile
            key="count"
            label="Total Credentials"
            value={records.length}
            icon={GraduationCap}
            subtext="Live PostgreSQL records"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Credential
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Credential' : 'Add Credential'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Record"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Degree / Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="e.g. BS Software Engineering" />
          </Form.Item>
          <Form.Item name="institution" label="Institution" rules={[{ required: true, message: 'Institution is required' }]}>
            <Input placeholder="e.g. Stanford University" />
          </Form.Item>
          <Form.Item name="duration" label="Duration" rules={[{ required: true, message: 'Duration is required' }]}>
            <Input placeholder="e.g. 2020 - 2024" />
          </Form.Item>
          <Form.Item name="sortorder" label="Sort Order">
            <InputNumber className="w-full" min={0} placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
