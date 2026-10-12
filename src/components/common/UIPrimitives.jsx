import React from 'react';
import { Input, Table } from 'antd';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Compact MetricTile (Image 1 Blueprint)
export const MetricTile = ({ label, value, subtext, icon: Icon, badge }) => (
  <div className="bg-card border border-border rounded-md px-4 py-3 flex items-center justify-between shadow-sm min-w-[180px]">
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold text-foreground font-mono tracking-tight tabular-nums">{value ?? '—'}</span>
        {badge && (
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {badge}
          </span>
        )}
      </div>
      {subtext && <p className="text-[11px] text-muted-foreground mt-0.5">{subtext}</p>}
    </div>
    {Icon && (
      <div className="p-2 rounded bg-muted text-muted-foreground">
        <Icon className="w-4 h-4 text-primary" />
      </div>
    )}
  </div>
);

// Page Header
export const PageHeader = ({ title, subtitle, actions, metrics }) => (
  <div className="mb-6 space-y-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border">
      <div>
        <h1 className="text-lg font-bold text-foreground tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
    {metrics && <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{metrics}</div>}
  </div>
);

const searchableText = (value) => {
  if (Array.isArray(value)) return value.map(searchableText).join(' ');
  if (value && typeof value === 'object') return Object.values(value).map(searchableText).join(' ');
  return value == null ? '' : String(value);
};

export const AdminDataTable = ({
  dataSource = [],
  columns,
  rowKey = 'id',
  loading = false,
  searchPlaceholder = 'Search records',
}) => {
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const searchValue = search.trim().toLowerCase();
  const filteredRecords = searchValue
    ? dataSource.filter((record) => searchableText(record).toLowerCase().includes(searchValue))
    : dataSource;

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="flex flex-col gap-2 border-b border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          allowClear
          value={search}
          placeholder={searchPlaceholder}
          prefix={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
          className="w-full sm:max-w-xs"
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
        />
        <span className="text-[11px] font-mono tabular-nums text-muted-foreground">
          {filteredRecords.length} of {dataSource.length} records
        </span>
      </div>
      <Table
        dataSource={filteredRecords}
        columns={columns}
        rowKey={rowKey}
        loading={loading}
        size="middle"
        scroll={{ x: 'max-content' }}
        pagination={filteredRecords.length > 10 ? {
          current: currentPage,
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          onChange: setCurrentPage,
        } : false}
      />
    </div>
  );
};
