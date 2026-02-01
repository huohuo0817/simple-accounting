import React from 'react';
import { Form, Card, InputNumber, Button, Space, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import type { InitialAssets } from '../types';

const { Title, Text } = Typography;

export const InitialSetup = () => {
  const navigate = useNavigate();
  const { handleInitialize } = useData();
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const initialAssets: InitialAssets = {
        deposit: values.deposit || 0,
        loan: values.loan || 0,
        pension: values.pension || 0,
        investmentPrincipal: values.investmentPrincipal || 0,
        investmentReturn: values.investmentReturn || 0,
      };

      handleInitialize(initialAssets);
      navigate('/');
    } catch (error) {
      console.error('初始化失败:', error);
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '24px',
      background: '#f0f2f5',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '500px',
        }}
        title={
          <Title level={3} style={{ textAlign: 'center', margin: 0 }}>
            初始资产设置
          </Title>
        }
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Text type="secondary">
            首次使用需要设置初始资产，以便后续计算累计数据
          </Text>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            label="存款（元）"
            name="deposit"
            initialValue={0}
            rules={[{ required: true, message: '请输入存款金额' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>

          <Form.Item
            label="贷款（元）"
            name="loan"
            initialValue={0}
            rules={[{ required: true, message: '请输入贷款金额' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>

          <Form.Item
            label="个人养老金（元）"
            name="pension"
            initialValue={0}
            rules={[{ required: true, message: '请输入养老金金额' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>

          <Form.Item
            label="投资本金（元）"
            name="investmentPrincipal"
            initialValue={0}
            rules={[{ required: true, message: '请输入投资本金' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
          </Form.Item>

          <Form.Item
            label="投资收益（元）"
            name="investmentReturn"
            initialValue={0}
            rules={[{ required: true, message: '请输入投资收益' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="可为负数" />
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Space>
            <Button onClick={() => navigate('/settings')}>
              跳过
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              完成设置
            </Button>
          </Space>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            所有数据存储在本地浏览器中，不会上传到服务器
          </Text>
        </div>
      </Card>
    </div>
  );
};
