import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  HomeOutlined,
  PlusOutlined,
  HistoryOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { DataProvider, useData } from './contexts/DataContext';
import { Home } from './pages/Home';
import { DataEntry } from './pages/DataEntry';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { InitialSetup } from './pages/InitialSetup';

const { Header, Content } = Layout;

const AppContent = () => {
  const location = useLocation();
  const { isInitialized } = useData();

  if (!isInitialized && location.pathname !== '/initial-setup') {
    return <InitialSetup />;
  }

  const selectedKey = location.pathname === '/'
    ? 'home'
    : location.pathname === '/entry'
    ? 'entry'
    : location.pathname === '/history'
    ? 'history'
    : 'settings';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '64px' }}>
          <h1 style={{ margin: 0, marginRight: 48 }}>记账本</h1>
          <Menu
            mode="horizontal"
            selectedKeys={[selectedKey]}
            style={{ flex: 1, border: 'none' }}
            items={[
              {
                key: 'home',
                icon: <HomeOutlined />,
                label: '首页',
                onClick: () => window.location.href = '/',
              },
              {
                key: 'entry',
                icon: <PlusOutlined />,
                label: '数据录入',
                onClick: () => window.location.href = '/entry',
              },
              {
                key: 'history',
                icon: <HistoryOutlined />,
                label: '历史记录',
                onClick: () => window.location.href = '/history',
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: '设置',
                onClick: () => window.location.href = '/settings',
              },
            ]}
          />
        </div>
      </Header>
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/entry" element={<DataEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/initial-setup" element={<InitialSetup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Content>
    </Layout>
  );
};

const App = () => {
  return (
    <DataProvider>
      <Router>
        <AppContent />
      </Router>
    </DataProvider>
  );
};

export default App;
