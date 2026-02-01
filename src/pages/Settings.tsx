import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, InputNumber, Select, Modal, Progress, Space, message, Upload, Tabs } from 'antd';
import { PlusOutlined, DeleteOutlined, ExportOutlined, ImportOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { useData } from '../contexts/DataContext';
import { generateId, formatCurrency } from '../utils/format';
import type { Goal, GoalType } from '../types';

const { Option } = Select;
const { TabPane } = Tabs;

export const Settings = () => {
  const { goals, monthlyData, initialAssets, handleAddGoal, handleDeleteGoal, handleClearAllData, handleExportExcel, handleImportExcel } = useData();

  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [goalForm, setGoalForm] = useState<{
    type: GoalType;
    name: string;
    targetAmount: number;
  }>({
    type: 'monthlyDeposit',
    name: '',
    targetAmount: 0,
  });

  const calculateGoalProgress = (goal: Goal): number => {
    let currentAmount = 0;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    switch (goal.type) {
      case 'monthlyDeposit':
        const currentMonthData = monthlyData.find(
          (m) => m.year === currentYear && m.month === currentMonth
        );
        if (currentMonthData) {
          currentAmount = currentMonthData.newDeposit + currentMonthData.pensionContribution + currentMonthData.investmentPrincipal;
        }
        break;

      case 'monthlyRepayment':
        if (currentMonthData) {
          currentAmount = currentMonthData.monthlyLoanPayment;
        }
        break;

      case 'yearlyDeposit':
        const yearlyData = monthlyData.filter((m) => m.year === currentYear);
        currentAmount = yearlyData.reduce((sum, m) => sum + m.newDeposit + m.pensionContribution + m.investmentPrincipal, 0);
        break;

      case 'other':
        currentAmount = goal.currentAmount;
        break;
    }

    return currentAmount;
  };

  const handleAddGoalSubmit = () => {
    if (!goalForm.name || goalForm.targetAmount <= 0) {
      message.error('请填写完整的目标信息');
      return;
    }

    const currentAmount = calculateGoalProgress(goalForm as Goal);

    handleAddGoal({
      ...goalForm,
      currentAmount,
    });

    setGoalModalVisible(false);
    setGoalForm({
      type: 'monthlyDeposit',
      name: '',
      targetAmount: 0,
    });
    message.success('目标添加成功');
  };

  const handleClearData = () => {
    Modal.confirm({
      title: '确认清空',
      icon: <ExclamationCircleOutlined />,
      content: '此操作将清空所有数据，包括月度记录、目标和初始资产，且无法恢复。确定要继续吗？',
      onOk: () => {
        handleClearAllData();
        message.success('数据已清空');
        window.location.reload();
      },
    });
  };

  const uploadProps: UploadProps = {
    accept: '.xlsx,.xls',
    showUploadList: false,
    beforeUpload: async (file) => {
      const success = await handleImportExcel(file);
      if (success) {
        message.success('导入成功');
      } else {
        message.error('导入失败，请检查文件格式');
      }
      return false;
    },
  };

  const getGoalTypeName = (type: GoalType): string => {
    switch (type) {
      case 'monthlyDeposit':
        return '月度存款目标';
      case 'monthlyRepayment':
        return '月度还款目标';
      case 'yearlyDeposit':
        return '年度存款目标';
      case 'other':
        return '其他目标';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>设置</h1>

      <Tabs defaultActiveKey="goals">
        <TabPane tab="目标设置" key="goals">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setGoalModalVisible(true)}>
              新增目标
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            {goals.map((goal) => {
              const currentAmount = calculateGoalProgress(goal);
              const progress = (currentAmount / goal.targetAmount) * 100;

              return (
                <Col key={goal.id} xs={24} sm={12} md={8}>
                  <Card
                    title={getGoalTypeName(goal.type)}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteGoal(goal.id)}
                      />
                    }
                  >
                    <div style={{ marginBottom: 8 }}>
                      {goal.name}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      目标：{formatCurrency(goal.targetAmount)}
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      当前进度：{formatCurrency(currentAmount)}
                    </div>
                    <Progress percent={Math.min(progress, 100)} status={progress >= 100 ? 'success' : 'active'} />
                    <div style={{ marginTop: 8, textAlign: 'right', color: '#999', fontSize: '12px' }}>
                      完成度：{progress.toFixed(2)}%
                    </div>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {goals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#999' }}>
              暂无目标，点击上方按钮添加
            </div>
          )}
        </TabPane>

        <TabPane tab="数据管理" key="data">
          <Card title="数据管理">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <h3>导出数据</h3>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  导出所有数据到 Excel 文件，用于备份或迁移
                </p>
                <Button icon={<ExportOutlined />} onClick={() => handleExportExcel()}>
                  导出全部数据
                </Button>
              </div>

              <div>
                <h3>导入数据</h3>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  从 Excel 文件导入备份数据，会覆盖相同年月的记录
                </p>
                <Upload {...uploadProps}>
                  <Button icon={<ImportOutlined />}>
                    导入数据
                  </Button>
                </Upload>
              </div>

              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 24 }}>
                <h3 style={{ color: '#ff4d4f' }}>危险区域</h3>
                <p style={{ color: '#666', marginBottom: 16 }}>
                  清空所有应用数据，此操作不可恢复
                </p>
                <Button danger onClick={handleClearData}>
                  清空所有数据
                </Button>
              </div>
            </Space>
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title="新增目标"
        open={goalModalVisible}
        onOk={handleAddGoalSubmit}
        onCancel={() => setGoalModalVisible(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>目标类型</label>
            <Select
              value={goalForm.type}
              onChange={(value) => setGoalForm({ ...goalForm, type: value })}
              style={{ width: '100%' }}
            >
              <Option value="monthlyDeposit">月度存款目标</Option>
              <Option value="monthlyRepayment">月度还款目标</Option>
              <Option value="yearlyDeposit">年度存款目标</Option>
              <Option value="other">其他目标</Option>
            </Select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>目标名称</label>
            <Input
              value={goalForm.name}
              onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })}
              placeholder="例如：2025年存款目标"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 8 }}>目标金额</label>
            <InputNumber
              value={goalForm.targetAmount}
              onChange={(value) => setGoalForm({ ...goalForm, targetAmount: value || 0 })}
              style={{ width: '100%' }}
              min={0}
              prefix="¥"
            />
          </div>
        </Space>
      </Modal>
    </div>
  );
};
