import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, Switch, Popconfirm, Rate, message } from 'antd';
import { Plus, Edit2, Trash2, MessageSquareQuote } from 'lucide-react';
import { testimonialsService } from '../../services/modules/testimonials/testimonials.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const TestimonialsPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => testimonialsService.getAllTestimonials(),
  });

  const createMutation = useMutation({
    mutationFn: (values) => testimonialsService.createTestimonial(values),
    onSuccess: () => {
      message.success('Testimonial created');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => testimonialsService.updateTestimonial(id, values),
    onSuccess: () => {
      message.success('Testimonial updated');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => testimonialsService.deleteTestimonial(id),
    onSuccess: () => {
      message.success('Testimonial deleted');
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
      form.setFieldsValue({ stars: 5, isvisible: true, likes: 0 });
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
      title: 'Author',
      dataIndex: 'name',
      key: 'name',
      render: (val, record) => (
        <div>
          <p className="font-semibold text-foreground text-xs">{val}</p>
          <p className="text-[11px] text-muted-foreground">{record.title} {record.company && `@ ${record.company}`}</p>
        </div>
      ),
    },
    {
      title: 'Rating',
      dataIndex: 'stars',
      key: 'stars',
      width: 140,
      render: (val) => <Rate disabled defaultValue={val || 5} className="text-xs" />,
    },
    {
      title: 'Testimonial',
      dataIndex: 'testimonial',
      key: 'testimonial',
      ellipsis: true,
      render: (val) => <span className="text-xs text-muted-foreground">{val}</span>,
    },
    {
      title: 'Visibility',
      dataIndex: 'isvisible',
      key: 'isvisible',
      width: 100,
      render: (val, record) => (
        <Switch
          size="small"
          checked={val}
          disabled={!is2FAVerified}
          onChange={(checked) => updateMutation.mutate({ id: record.id, values: { isvisible: checked } })}
        />
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
            title="Delete this testimonial?"
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
        title="Testimonials & Reviews"
        subtitle="Manage client social proof and ratings"
        metrics={[
          <MetricTile
            key="count"
            label="Total Reviews"
            value={records.length}
            icon={MessageSquareQuote}
            subtext="Live feedback entries"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Testimonial
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Review"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Author Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. John Doe" />
          </Form.Item>
          <Form.Item name="title" label="Job Title">
            <Input placeholder="e.g. CTO / Product Manager" />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input placeholder="e.g. Acme Corp" />
          </Form.Item>
          <Form.Item name="testimonial" label="Testimonial Quote" rules={[{ required: true, message: 'Quote is required' }]}>
            <Input.TextArea rows={3} placeholder="Client feedback text..." />
          </Form.Item>
          <Form.Item name="stars" label="Star Rating">
            <Rate />
          </Form.Item>
          <Form.Item name="imageurl" label="Avatar URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="isvisible" label="Publicly Visible" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
