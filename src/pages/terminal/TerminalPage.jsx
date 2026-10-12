import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Card, Popconfirm, Tag, message } from 'antd';
import { Terminal as TerminalIcon, Save, Plus, Trash2 } from 'lucide-react';
import { terminalService } from '../../services/modules/terminal/terminal.service';
import { MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const TerminalPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [form] = Form.useForm();
  const [newCmd, setNewCmd] = useState('');

  const { data: terminal = {}, isLoading } = useQuery({
    queryKey: ['terminal'],
    queryFn: () => terminalService.getConfig(),
  });

  useEffect(() => {
    if (terminal && Object.keys(terminal).length > 0) {
      form.setFieldsValue(terminal);
    }
  }, [terminal, form]);

  const updateConfigMutation = useMutation({
    mutationFn: (values) => terminalService.updateConfig(terminal?.id, values),
    onSuccess: () => {
      message.success('Terminal configuration saved');
      queryClient.invalidateQueries({ queryKey: ['terminal'] });
    },
    onError: (err) => message.error(err.message || 'Save failed'),
  });

  const updateCommandsMutation = useMutation({
    mutationFn: (commands) => terminalService.setProtectedCommands(terminal?.id, commands),
    onSuccess: () => {
      message.success('Protected commands updated');
      queryClient.invalidateQueries({ queryKey: ['terminal'] });
      setNewCmd('');
    },
    onError: (err) => message.error(err.message || 'Update failed'),
  });

  const handleAddCommand = () => {
    if (!newCmd.trim()) return;
    const currentList = terminal?.protected_commands?.map((c) => c.command) || [];
    if (!currentList.includes(newCmd.trim())) {
      updateCommandsMutation.mutate([...currentList, newCmd.trim()]);
    }
  };

  const handleRemoveCommand = (cmdToRemove) => {
    const currentList = terminal?.protected_commands?.map((c) => c.command) || [];
    updateCommandsMutation.mutate(currentList.filter((c) => c !== cmdToRemove));
  };

  const handleSaveConfig = async () => {
    try {
      const values = await form.validateFields();
      updateConfigMutation.mutate(values);
    } catch {
      // validation error
    }
  };

  return (
    <div>
      <PageHeader
        title="Terminal & CLI System"
        subtitle="Manage in-browser terminal configuration, default credentials, and protected commands"
        metrics={[
          <MetricTile
            key="version"
            label="CLI Version"
            value={`v${terminal?.version || '1.0.0'}`}
            icon={TerminalIcon}
            subtext={`User: ${terminal?.defaultuser || 'guest'}`}
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Save className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            loading={updateConfigMutation.isPending}
            onClick={handleSaveConfig}
          >
            Save CLI Config
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Terminal Credentials */}
        <div className="bg-card border border-border rounded-md p-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border">
            CLI Configuration & Defaults
          </h2>
          <Form form={form} layout="vertical" disabled={isLoading}>
            <Form.Item name="version" label="Terminal Version" rules={[{ required: true }]}>
              <Input placeholder="e.g. 6.3.1" />
            </Form.Item>
            <Form.Item name="defaultuser" label="Default Terminal User" rules={[{ required: true }]}>
              <Input placeholder="guest" />
            </Form.Item>
            <Form.Item name="defaultpass" label="Default Password">
              <Input.Password placeholder="Default password" />
            </Form.Item>
          </Form>
        </div>

        {/* Protected Commands */}
        <div className="bg-card border border-border rounded-md p-6">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 pb-2 border-b border-border">
            Protected Root Commands ({terminal?.protected_commands?.length || 0})
          </h2>
          <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
            {terminal?.protected_commands?.map((c) => (
              <div key={c.id || c.command} className="flex items-center justify-between p-2 rounded bg-muted text-xs">
                <span className="font-mono text-amber-400">$ {c.command}</span>
                <Popconfirm
                  title="Remove protected command?"
                  disabled={!is2FAVerified}
                  onConfirm={() => handleRemoveCommand(c.command)}
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
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              size="small"
              placeholder="e.g. sudo rm -rf /"
              value={newCmd}
              onChange={(e) => setNewCmd(e.target.value)}
            />
            <Button
              size="small"
              type="primary"
              disabled={!is2FAVerified || !newCmd.trim()}
              onClick={handleAddCommand}
            >
              Protect
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
