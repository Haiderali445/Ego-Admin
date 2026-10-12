import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Form, Input, InputNumber, Popconfirm, Tag, message } from 'antd';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';
import { servicesService } from '../../services/modules/services/services.service';
import { AdminDataTable, MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const ServicesPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesService.getAllServices(),
  });

  const createMutation = useMutation({
    mutationFn: ({ data, stack, steps }) => servicesService.createService(data, stack, steps),
    onSuccess: () => {
      message.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Creation failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data, stack, steps, currentStack, currentSteps }) =>
      servicesService.updateService(id, data, stack, steps, currentStack, currentSteps),
    onSuccess: () => {
      message.success('Service updated');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => servicesService.deleteService(id),
    onSuccess: () => {
      message.success('Service deleted');
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
    onError: (err) => message.error(err.message || 'Deletion failed'),
  });

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        ...item,
        stackString: (item.service_full_tech_stack ?? []).map((row) => row.tech).join(', '),
        steps: item.service_implementation_steps ?? [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ steps: [] });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const stackList = values.stackString
        ? values.stackString.split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
        : [];
      const stepsList = (values.steps ?? [])
        .map((step) => ({ title: step?.title?.trim(), description: step?.description?.trim() }))
        .filter((step) => step.title || step.description);

      const payload = {
        name: values.name,
        icontype: values.icontype,
        description: values.description,
        problem: values.problem,
        solution: values.solution,
        sortorder: values.sortorder,
      };

      if (editingItem) {
        updateMutation.mutate({
          id: editingItem.id,
          data: payload,
          stack: stackList,
          steps: stepsList,
          currentStack: editingItem.service_full_tech_stack ?? [],
          currentSteps: editingItem.service_implementation_steps ?? [],
        });
      } else {
        createMutation.mutate({ data: payload, stack: stackList, steps: stepsList });
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
      title: 'Service Name',
      dataIndex: 'name',
      key: 'name',
      render: (val, record) => (
        <div>
          <span className="font-semibold text-foreground text-xs">{val}</span>
          <p className="text-[11px] text-muted-foreground line-clamp-1">{record.description}</p>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'icontype',
      key: 'icontype',
      width: 120,
      render: (val) => <span className="text-xs font-mono">{val || '—'}</span>,
    },
    {
      title: 'Tech Stack (Child Relation)',
      dataIndex: 'service_full_tech_stack',
      key: 'service_full_tech_stack',
      render: (stackItems) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {stackItems?.map((s, idx) => (
            <Tag key={idx} className="text-[10px] m-0 bg-muted border-border text-foreground">
              {typeof s === 'string' ? s : s.tech}
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
            title="Delete service?"
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
        title="Services & Offerings"
        subtitle="Manage engineering services and child technology stacks"
        metrics={[
          <MetricTile
            key="count"
            label="Total Services"
            value={records.length}
            icon={Layers}
            subtext="Live service offerings"
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            onClick={() => handleOpenModal()}
          >
            Add Service
          </Button>
        }
      />

      <AdminDataTable dataSource={records} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title={editingItem ? 'Edit Service' : 'Add Service'}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText="Save Service"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Service Name" rules={[{ required: true, message: 'Name is required' }]}>
            <Input placeholder="e.g. Enterprise Cloud Migration" />
          </Form.Item>
          <Form.Item name="icontype" label="Icon / Domain Type">
            <Input placeholder="e.g. Website, WebApps, Business" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true, message: 'Description is required' }]}>
            <Input.TextArea rows={2} placeholder="Service scope and architecture..." />
          </Form.Item>
          <Form.Item name="problem" label="Client Problem">
            <Input.TextArea rows={2} placeholder="What challenge does this service address?" />
          </Form.Item>
          <Form.Item name="solution" label="Proposed Solution">
            <Input.TextArea rows={2} placeholder="How is the challenge solved?" />
          </Form.Item>
          <Form.Item name="stackString" label="Technology Stack (comma or newline separated)">
            <Input.TextArea rows={2} placeholder="React, AWS, Node.js, Docker" />
          </Form.Item>
          <Form.List name="steps">
            {(fields, { add, remove }) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Implementation Steps</span>
                  <Button size="small" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => add({ title: '', description: '' })}>
                    Add Step
                  </Button>
                </div>
                {fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-1 gap-x-3 rounded-md border border-border p-3 sm:grid-cols-[1fr_auto]">
                    <Form.Item name={[field.name, 'title']} label={`Step ${field.name + 1}`} className="mb-2">
                      <Input placeholder="Discovery & requirements" />
                    </Form.Item>
                    <Button className="sm:mt-8" type="text" danger aria-label="Remove step" icon={<Trash2 className="h-4 w-4" />} onClick={() => remove(field.name)} />
                    <Form.Item name={[field.name, 'description']} className="mb-0 sm:col-span-2">
                      <Input.TextArea rows={2} placeholder="Describe this implementation step" />
                    </Form.Item>
                  </div>
                ))}
              </div>
            )}
          </Form.List>
          <Form.Item name="sortorder" label="Sort Order">
            <InputNumber className="w-full" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
