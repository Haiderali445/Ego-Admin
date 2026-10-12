import React, { useEffect } from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import { useUIStore } from '../../stores/uiStore';

export const AntdProvider = ({ children }) => {
  const theme = useUIStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const darkTokens = {
    token: {
      colorBgBase: '#0B0F19',
      colorBgContainer: '#0F172A',
      colorBgElevated: '#1E293B',
      colorBorder: 'rgba(148, 163, 184, 0.14)',
      colorBorderSecondary: 'rgba(148, 163, 184, 0.08)',
      colorPrimary: '#3B82F6',
      colorText: '#E2E8F0',
      colorTextSecondary: '#94A3B8',
      colorTextTertiary: '#64748B',
      colorSuccess: '#10B981',
      colorWarning: '#F59E0B',
      colorError: '#EF4444',
      borderRadius: 6,
      fontSize: 13,
      controlHeight: 34,
      fontFamily: 'inherit',
    },
    components: {
      Table: {
        headerBg: '#131C31',
        headerColor: '#94A3B8',
        rowHoverBg: '#1E293B',
        borderColor: 'rgba(148, 163, 184, 0.10)',
        headerSplitColor: 'transparent',
      },
      Modal: {
        contentBg: '#0F172A',
        headerBg: '#0F172A',
      },
      Drawer: {
        colorBgElevated: '#0F172A',
      },
      Card: {
        colorBgContainer: '#0F172A',
        colorBorderSecondary: 'rgba(148, 163, 184, 0.12)',
      },
      Input: {
        colorBgContainer: '#131C31',
        colorBorder: 'rgba(148, 163, 184, 0.18)',
      },
      Select: {
        colorBgContainer: '#131C31',
        colorBorder: 'rgba(148, 163, 184, 0.18)',
      },
    },
  };

  const lightTokens = {
    token: {
      colorBgBase: '#F8FAFC',
      colorBgContainer: '#FFFFFF',
      colorBgElevated: '#F1F5F9',
      colorBorder: '#E2E8F0',
      colorBorderSecondary: '#F1F5F9',
      colorPrimary: '#2563EB',
      colorText: '#0F172A',
      colorTextSecondary: '#475569',
      colorTextTertiary: '#94A3B8',
      colorSuccess: '#059669',
      colorWarning: '#D97706',
      colorError: '#DC2626',
      borderRadius: 6,
      fontSize: 13,
      controlHeight: 34,
      fontFamily: 'inherit',
    },
    components: {
      Table: {
        headerBg: '#F8FAFC',
        headerColor: '#475569',
        rowHoverBg: '#F1F5F9',
        borderColor: '#E2E8F0',
      },
    },
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        ...(theme === 'dark' ? darkTokens : lightTokens),
      }}
    >
      {children}
    </ConfigProvider>
  );
};
