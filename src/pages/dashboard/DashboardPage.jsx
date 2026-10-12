import React from 'react';
import { MetricTile, PageHeader } from '../../components/common/UIPrimitives';
import { Activity } from 'lucide-react';

export const DashboardPage = () => {
  return (
    <div>
      <PageHeader
        title="System Overview"
        subtitle="High-density administrative telemetry & domain status monitor"
        metrics={[
          <MetricTile key="state" label="Environment" value="Production" subtext="Live Supabase Cloud" icon={Activity} />,
          <MetricTile key="domains" label="Domain Services" value="11" subtext="Active & Synced" badge="Healthy" />,
        ]}
      />
      <div className="bg-card border border-border rounded-md p-8 text-center text-muted-foreground">
        <p className="text-sm font-medium">Dashboard service integration reserved for upcoming telemetry release.</p>
        <p className="text-xs text-muted-foreground mt-1">Select any domain from the left sidebar to manage live database records.</p>
      </div>
    </div>
  );
};
