import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { TrendChart } from '../components/TrendChart';
import { formatCurrency, formatPercent, calculateSavingsRate, calculateAnnualizedReturn, calculateCumulativeData } from '../utils/format';
import type { MonthlyData } from '../types';

const { Option } = Select;

export const Home = () => {
  const navigate = useNavigate();
  const { monthlyData, initialAssets } = useData();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [chartType, setChartType] = useState<'income' | 'deposit' | 'return' | 'loan'>('income');

  useEffect(() => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
  }, []);

  const currentYearData = selectedYear === 'all' ? monthlyData : monthlyData.filter((m) => m.year === selectedYear);

  const latestData = currentYearData.length > 0 ? currentYearData[currentYearData.length - 1] : null;

  const cumulativeData = calculateCumulativeData(monthlyData, initialAssets || {
    deposit: 0,
    pension: 0,
    investmentPrincipal: 0,
    investmentReturn: 0,
  });

  const latestCumulative = cumulativeData.length > 0 ? cumulativeData[cumulativeData.length - 1] : null;

  const getCurrentMonthStats = () => {
    if (!latestData) {
      return { deposited: 0, repaid: 0, returned: 0, saved: 0 };
    }
    return {
      deposited: latestData.newDeposit + latestData.pensionContribution + latestData.investmentPrincipal,
      repaid: latestData.monthlyLoanPayment,
      returned: latestData.investmentReturn,
      saved: latestData.netSavings,
    };
  };

  const getCumulativeStats = () => {
    if (!latestCumulative || !initialAssets) {
      return { deposited: 0, repaid: 0, returned: 0, saved: 0 };
    }
    return {
      deposited: latestCumulative.cumulativeDeposit + latestCumulative.cumulativePension + latestCumulative.cumulativePrincipal,
      repaid: latestCumulative.cumulativeLoanPayment,
      returned: latestCumulative.cumulativeReturn,
      saved: monthlyData.reduce((sum, m) => sum + m.netSavings, 0),
    };
  };

  const currentMonthStats = getCurrentMonthStats();
  const cumulativeStats = getCumulativeStats();

  const savingsRate = latestData
    ? calculateSavingsRate(latestData.netSavings, latestData.totalIncome)
    : 0;

  const annualizedReturn = latestCumulative && initialAssets
    ? calculateAnnualizedReturn(
      latestCumulative.cumulativeReturn - initialAssets.investmentReturn,
      latestCumulative.cumulativePrincipal - initialAssets.investmentPrincipal
    )
    : 0;

  const years = Array.from(new Set(monthlyData.map((m) => m.year))).sort();

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>我的财务总览</h1>
        <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120 }}>
          <Option value="all">全部</Option>
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}年
            </Option>
          ))}
        </Select>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card title="当月 - 存入" bordered={false}>
            <Statistic value={currentMonthStats.deposited} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="当月 - 还贷" bordered={false}>
            <Statistic value={currentMonthStats.repaid} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="当月 - 收益" bordered={false}>
            <Statistic value={currentMonthStats.returned} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="当月 - 净储蓄" bordered={false}>
            <Statistic value={currentMonthStats.saved} precision={2} prefix="¥" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card title="累计 - 存入" bordered={false}>
            <Statistic value={cumulativeStats.deposited} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="累计 - 还贷" bordered={false}>
            <Statistic value={cumulativeStats.repaid} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="累计 - 收益" bordered={false}>
            <Statistic value={cumulativeStats.returned} precision={2} prefix="¥" />
          </Card>
        </Col>
        <Col span={6}>
          <Card title="累计 - 净储蓄" bordered={false}>
            <Statistic value={cumulativeStats.saved} precision={2} prefix="¥" />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="储蓄率"
              value={savingsRate}
              precision={2}
              suffix="%"
              valueStyle={{ color: savingsRate > 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="年化收益率"
              value={annualizedReturn}
              precision={2}
              suffix="%"
              valueStyle={{ color: annualizedReturn > 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card bordered={false}>
        <TrendChart
          monthlyData={currentYearData as MonthlyData[]}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
      </Card>
    </div>
  );
};
