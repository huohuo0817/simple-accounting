import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col, Select, InputNumber, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { calculateTotalIncome, calculateTotalExpense, generateId } from '../utils/format';
import type { IncomeItem, ExpenseItem } from '../types';

const { Option } = Select;

export const DataEntry = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { monthlyData, initialAssets, handleSaveMonthlyData } = useData();
  const [form] = Form.useForm();

  const [otherIncomes, setOtherIncomes] = useState<IncomeItem[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<ExpenseItem[]>([]);

  useEffect(() => {
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const now = new Date();
    const year = yearParam ? parseInt(yearParam) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam) : now.getMonth() + 1;

    form.setFieldsValue({
      year,
      month,
    });

    const existingData = monthlyData.find((m) => m.year === year && m.month === month);
    if (existingData) {
      form.setFieldsValue({
        salary: existingData.salary,
        sideJob: existingData.sideJob,
        providentFund: existingData.providentFund,
        loanRepayment: existingData.loanRepayment,
        newDeposit: existingData.newDeposit,
        pensionContribution: existingData.pensionContribution,
        investmentPrincipal: existingData.investmentPrincipal,
        investmentReturn: existingData.investmentReturn,
        monthlyLoanPayment: existingData.monthlyLoanPayment,
        loanBalance: existingData.loanBalance,
      });
      setOtherIncomes(existingData.otherIncomes);
      setOtherExpenses(existingData.otherExpenses);
    }
  }, [searchParams, monthlyData, form]);

  const calculateTotals = () => {
    const values = form.getFieldsValue();
    const totalIncome = calculateTotalIncome(
      values.salary || 0,
      values.sideJob || 0,
      values.providentFund || 0,
      otherIncomes
    );
    const totalExpense = calculateTotalExpense(
      values.loanRepayment || 0,
      otherExpenses
    );
    const netSavings = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netSavings };
  };

  const [totals, setTotals] = useState(calculateTotals);

  const onValuesChange = () => {
    setTotals(calculateTotals());
  };

  const handleAddOtherIncome = () => {
    setOtherIncomes([...otherIncomes, { id: generateId(), name: '', amount: 0 }]);
  };

  const handleRemoveOtherIncome = (id: string) => {
    setOtherIncomes(otherIncomes.filter((item) => item.id !== id));
  };

  const handleOtherIncomeChange = (id: string, field: keyof IncomeItem, value: string | number) => {
    setOtherIncomes(
      otherIncomes.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setTimeout(() => setTotals(calculateTotals()), 0);
  };

  const handleAddOtherExpense = () => {
    setOtherExpenses([...otherExpenses, { id: generateId(), name: '', amount: 0 }]);
  };

  const handleRemoveOtherExpense = (id: string) => {
    setOtherExpenses(otherExpenses.filter((item) => item.id !== id));
  };

  const handleOtherExpenseChange = (id: string, field: keyof ExpenseItem, value: string | number) => {
    setOtherExpenses(
      otherExpenses.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
    setTimeout(() => setTotals(calculateTotals()), 0);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const { totalIncome, totalExpense, netSavings } = totals;

      const allocationSum = (values.newDeposit || 0) + (values.pensionContribution || 0) + (values.investmentPrincipal || 0);

      if (Math.abs(netSavings - allocationSum) > 0.01) {
        message.error(`净储蓄分配校验失败：净储蓄 ¥${netSavings.toFixed(2)} 与分配总和 ¥${allocationSum.toFixed(2)} 不一致`);
        return;
      }

      handleSaveMonthlyData({
        ...values,
        otherIncomes,
        otherExpenses,
        totalIncome,
        totalExpense,
        netSavings,
        totalDeposit: initialAssets ? initialAssets.deposit + values.newDeposit : values.newDeposit,
        pensionBalance: initialAssets ? initialAssets.pension + values.pensionContribution : values.pensionContribution,
        totalInvestmentPrincipal: initialAssets ? initialAssets.investmentPrincipal + values.investmentPrincipal : values.investmentPrincipal,
        totalInvestmentReturn: initialAssets ? initialAssets.investmentReturn + values.investmentReturn : values.investmentReturn,
      });

      message.success('保存成功');
      navigate('/');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const years = Array.from(new Set([...monthlyData.map((m) => m.year), new Date().getFullYear()])).sort();

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 24 }}>每月盘点</h1>

      <Form form={form} onValuesChange={onValuesChange} layout="vertical">
        <Card title="收入" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="年份" name="year">
                <Select>
                  {years.map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="月份" name="month">
                <Select>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Option key={month} value={month}>
                      {month}月
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="工资收入（元）" name="salary" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="兼职收入（元）" name="sideJob" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="公积金（元）" name="providentFund" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="其他收入">
            {otherIncomes.map((item) => (
              <Space key={item.id} style={{ marginBottom: 8, display: 'flex' }} align="baseline">
                <Input
                  placeholder="名称"
                  value={item.name}
                  onChange={(e) => handleOtherIncomeChange(item.id, 'name', e.target.value)}
                  style={{ width: 150 }}
                />
                <InputNumber
                  placeholder="金额"
                  value={item.amount}
                  onChange={(value) => handleOtherIncomeChange(item.id, 'amount', value || 0)}
                  style={{ width: 120 }}
                  min={0}
                />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveOtherIncome(item.id)} />
              </Space>
            ))}
            <Button type="dashed" onClick={handleAddOtherIncome} icon={<PlusOutlined />}>
              添加其他收入
            </Button>
          </Form.Item>

          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            总收入：¥{totals.totalIncome.toFixed(2)}
          </div>
        </Card>

        <Card title="支出" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="还贷款（元）" name="loanRepayment" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="其他支出">
            {otherExpenses.map((item) => (
              <Space key={item.id} style={{ marginBottom: 8, display: 'flex' }} align="baseline">
                <Input
                  placeholder="名称"
                  value={item.name}
                  onChange={(e) => handleOtherExpenseChange(item.id, 'name', e.target.value)}
                  style={{ width: 150 }}
                />
                <InputNumber
                  placeholder="金额"
                  value={item.amount}
                  onChange={(value) => handleOtherExpenseChange(item.id, 'amount', value || 0)}
                  style={{ width: 120 }}
                  min={0}
                />
                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveOtherExpense(item.id)} />
              </Space>
            ))}
            <Button type="dashed" onClick={handleAddOtherExpense} icon={<PlusOutlined />}>
              添加其他支出
            </Button>
          </Form.Item>

          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
            总支出：¥{totals.totalExpense.toFixed(2)}
          </div>

          <div style={{ marginTop: 16, fontSize: '16px', fontWeight: 'bold' }}>
            净储蓄：¥{totals.netSavings.toFixed(2)}
          </div>
        </Card>

        <Card title="净储蓄分配" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="新增存款（元）" name="newDeposit" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="个人养老金（元）" name="pensionContribution" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="投资本金（元）" name="investmentPrincipal" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="投资收益" style={{ marginBottom: 16 }}>
          <Form.Item label="当月投资收益（元）" name="investmentReturn" initialValue={0}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        <Card title="贷款" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="本月还款（元）" name="monthlyLoanPayment" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="贷款余额（元）" name="loanBalance" initialValue={0}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" onClick={handleSubmit}>
              保存
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};
