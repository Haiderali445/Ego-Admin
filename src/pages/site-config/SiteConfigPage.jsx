import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Form, Input, Button, Switch, Card, message } from 'antd';
import { Settings, Save, CheckCircle } from 'lucide-react';
import { siteConfigService } from '../../services/modules/site-config/siteConfig.service';
import { MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { useAuth } from '../../context/AuthContext';

export const SiteConfigPage = () => {
  const queryClient = useQueryClient();
  const { is2FAVerified } = useAuth();
  const [form] = Form.useForm();

  const { data: config = {}, isLoading } = useQuery({
    queryKey: ['site-config'],
    queryFn: () => siteConfigService.getConfig(),
  });

  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      form.setFieldsValue(config);
    }
  }, [config, form]);

  const updateMutation = useMutation({
    mutationFn: (values) => siteConfigService.updateConfig(config?.id, values),
    onSuccess: () => {
      message.success('Site configuration saved to Supabase');
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
    },
    onError: (err) => message.error(err.message || 'Save failed'),
  });

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      updateMutation.mutate(values);
    } catch {
      // validation error
    }
  };

  return (
    <div>
      <PageHeader
        title="Site Configuration & Telemetry"
        subtitle="Global platform status, developer stack variables, and copy"
        metrics={[
          <MetricTile
            key="status"
            label="Availability"
            value={config?.availabilitystatus ? 'Available' : 'Busy'}
            icon={CheckCircle}
            subtext={config?.availabilitylabel || 'Live status'}
            badge={config?.availabilitystatus ? 'Open' : 'Restricted'}
          />,
        ]}
        actions={
          <Button
            type="primary"
            icon={<Save className="w-4 h-4 inline mr-1" />}
            disabled={!is2FAVerified}
            loading={updateMutation.isPending}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        }
      />

      <div className="bg-card border border-border rounded-md p-6 max-w-4xl">
        <Form form={form} layout="vertical" disabled={isLoading}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Availability Block */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                Status & Availability
              </h2>
              <Form.Item name="availabilitystatus" label="Open to Work / Available" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="availabilitylabel" label="Status Label">
                <Input placeholder="e.g. Open to full-time roles & advisory" />
              </Form.Item>
              <Form.Item name="footertagline" label="Footer Tagline">
                <Input placeholder="e.g. Crafted with engineering rigor" />
              </Form.Item>
            </div>

            {/* Developer Stack */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
                Developer Environment Stack
              </h2>
              <Form.Item name="devstack_os" label="Primary OS">
                <Input placeholder="e.g. Windows 11 Pro / Arch Linux" />
              </Form.Item>
              <Form.Item name="devstack_editor" label="Primary Editor">
                <Input placeholder="e.g. VS Code / Neovim" />
              </Form.Item>
              <Form.Item name="devstack_shell" label="Default Shell">
                <Input placeholder="e.g. PowerShell 7 / Zsh" />
              </Form.Item>
              <Form.Item name="devstack_framework" label="Core Framework">
                <Input placeholder="e.g. React 18 / Vite / Next.js" />
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};
