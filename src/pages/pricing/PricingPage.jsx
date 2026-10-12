import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, InputNumber, Switch, Popconfirm, message } from 'antd';
import { Plus, Edit2, Trash2, CreditCard } from 'lucide-react';
import { pricingService } from '../../services/modules/pricing/pricing.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const PricingPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => pricingService.getAllPricing(),
  });

  const createMutation = useMutation({
    mutationFn: (values) => pricingService.createPricing(values),
    onSuccess: () => {
      message.success('Pricing tier created');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => pricingService.updatePricing(id, values),
    onSuccess: () => {
      message.success('Pricing tier updated');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pricingService.deletePricing(id),
    onSuccess: () => {
      message.success('Pricing tier deleted');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue(item);
    } else {
      form.resetFields();
      form.setFieldsValue({ ispopular: false, hasaws: false, hasdatabase: false, hasauth: false });
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
      title: 'Order',
      dataIndex: 'sortorder',
      key: 'sortorder',
      width: 70,
      render: (val) => <span className="font-mono text-xs">{val ?? '—'}</span>,
    },
    {
      title: 'Tier Name',
      dataIndex: 'name',
      key: 'name',
      render: (val, record) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground text-xs">{val}</span>
          {record.ispopular && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              POPULAR
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (val) => <span className="font-mono font-bold text-xs text-foreground">{val}</span>,
    },
    {
      title: 'Scope / Pages',
      dataIndex: 'pages',
      key: 'pages',
      render: (val) => <span className="text-xs text-muted-foreground">{val}</span>,
    },
    {
      title: 'Features',
      key: 'features',
      render: (_, record) => (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {record.hasaws && <span className="px-1.5 py-0.5 bg-muted rounded font-mono">AWS</span>}
          {record.hasdatabase && <span className="px-1.5 py-0.5 bg-muted rounded font-mono">DB ({record.databasesize || 'Std'})</span>}
          {record.hasauth && <span className="px-1.5 py-0.5 bg-muted rounded font-mono">Auth</span>}
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
            title="Delete pricing tier?"
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
        title="Pricing Plans"
        subtitle="Manage engineering packages and pricing tiers"
        metrics={[
          <MetricTile
            key="count"
            label="Pricing Tiers"
            value={records.length}
            icon={CreditCard}
            subtext="Live service tiers"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Plan
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Pricing Plan' : 'Add Pricing Plan'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Plan"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Plan Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Full-Stack SaaS MVP" />
          </Form.Item>
          <Form.Item name="price" label="Price Label" rules={[{ required: true, message: 'Price is required' }]}>
            <Input placeholder="e.g. $4,999 or Custom" />
          </Form.Item>
          <Form.Item name="pages" label="Scope / Deliverables">
            <Input placeholder="e.g. 5-7 Pages, Full Responsive" />
          </Form.Item>
          <Form.Item name="sortorder" label="Sort Order">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
          <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-md">
            <Form.Item name="ispopular" label="Popular Badge" valuePropName="checked" className="mb-0">
              <Switch />
            </Form.Item>
            <Form.Item name="hasauth" label="Auth Included" valuePropName="checked" className="mb-0">
              <Switch />
            </Form.Item>
            <Form.Item name="hasdatabase" label="Database Included" valuePropName="checked" className="mb-0">
              <Switch />
            </Form.Item>
            <Form.Item name="hasaws" label="AWS Cloud" valuePropName="checked" className="mb-0">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
