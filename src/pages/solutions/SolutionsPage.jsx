import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, InputNumber, Popconfirm, Tag, message } from 'antd';
import { Plus, Edit2, Trash2, Lightbulb } from 'lucide-react';
import { solutionsService } from '../../services/modules/solutions/solutions.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const SolutionsPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['solutions'],
    queryFn: () => solutionsService.getAllSolutions(),
  });

  const createMutation = useMutation({
    mutationFn: ({ data, tech }) => solutionsService.createSolution(data, tech),
    onSuccess: () => {
      message.success('Solution created successfully');
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, tech, currentTech }) =>
      solutionsService.updateSolution(id, data, tech, currentTech),
    onSuccess: () => {
      message.success('Solution updated');
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => solutionsService.deleteSolution(id),
    onSuccess: () => {
      message.success('Solution deleted');
      queryClient.invalidateQueries({ queryKey: ['solutions'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        techString: (item.solution_tech ?? []).map((row) => row.tech).join(', '),
      });
    } else {
      form.resetFields();
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
        category: values.category,
        description: values.description,
        sortorder: values.sortorder,
      };

      if (editingItem) {
        updateMutation.mutate({
          id: editingItem.id,
          data: payload,
          tech: techList,
          currentTech: editingItem.solution_tech ?? [],
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
      title: 'Solution Title',
      dataIndex: 'title',
      key: 'title',
      render: (val, record) => (
        <div>
          <span className="font-semibold text-foreground text-xs">{val}</span>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{record.description}</p>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (val) => <span className="text-xs font-mono">{val || '—'}</span>,
    },
    {
      title: 'Tech (Child Relation)',
      dataIndex: 'solution_tech',
      key: 'solution_tech',
      render: (techItems) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
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
            title="Delete solution?"
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
        title="Engineering Solutions"
        subtitle="Manage technical problem/solution stories and implementation technologies"
        metrics={[
          <MetricTile
            key="count"
            label="Total Solutions"
            value={records.length}
            icon={Lightbulb}
            subtext="Live architectural feats"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Solution
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Solution' : 'Add Solution'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Solution"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="title" label="Solution Title" rules={[{ required: true, message: 'Title is required' }]}>
            <Input placeholder="e.g. Distributed Consensus Engine" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input placeholder="e.g. Cloud Architecture / Real-Time Systems" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
            <Input.TextArea rows={3} placeholder="Technical challenge, approach, and outcome..." />
          </Form.Item>
          <Form.Item name="sortorder" label="Sort Order">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <Form.Item name="techString" label="Tech Tags (comma or newline separated)">
            <Input.TextArea rows={2} placeholder="Go, Kubernetes, Redis, gRPC" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
