import ReactECharts from 'echarts-for-react';
import { Select } from 'antd';
import type { MonthlyData } from '../types';

type ChartType = 'income' | 'deposit' | 'return' | 'loan';

interface TrendChartProps {
  monthlyData: MonthlyData[];
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

const { Option } = Select;

export const TrendChart = ({ monthlyData, chartType, onChartTypeChange }: TrendChartProps) => {
  const getChartOption = () => {
    const xAxisData = monthlyData.map((m) => `${m.year}-${String(m.month).padStart(2, '0')}`);

    let series: any[] = [];

    switch (chartType) {
      case 'income':
        series = [
          {
            name: '收入',
            type: 'bar',
            data: monthlyData.map((m) => m.totalIncome),
            itemStyle: { color: '#52c41a' },
          },
          {
            name: '支出',
            type: 'bar',
            data: monthlyData.map((m) => m.totalExpense),
            itemStyle: { color: '#ff4d4f' },
          },
          {
            name: '净储蓄',
            type: 'line',
            data: monthlyData.map((m) => m.netSavings),
            itemStyle: { color: '#1890ff' },
          },
        ];
        break;

      case 'deposit':
        series = [
          {
            name: '累计存款',
            type: 'line',
            data: monthlyData.map((m) => m.totalDeposit),
            itemStyle: { color: '#1890ff' },
          },
          {
            name: '个人养老金',
            type: 'line',
            data: monthlyData.map((m) => m.pensionBalance),
            itemStyle: { color: '#52c41a' },
          },
          {
            name: '累计投资本金',
            type: 'line',
            data: monthlyData.map((m) => m.totalInvestmentPrincipal),
            itemStyle: { color: '#faad14' },
          },
        ];
        break;

      case 'return':
        series = [
          {
            name: '当月收益',
            type: 'bar',
            data: monthlyData.map((m) => m.investmentReturn),
            itemStyle: { color: '#52c41a' },
          },
          {
            name: '累计收益',
            type: 'line',
            data: monthlyData.map((m) => m.totalInvestmentReturn),
            itemStyle: { color: '#1890ff' },
          },
        ];
        break;

      case 'loan':
        series = [
          {
            name: '本月还款',
            type: 'bar',
            data: monthlyData.map((m) => m.monthlyLoanPayment),
            itemStyle: { color: '#ff4d4f' },
          },
          {
            name: '贷款余额',
            type: 'line',
            data: monthlyData.map((m) => m.loanBalance),
            itemStyle: { color: '#faad14' },
          },
        ];
        break;
    }

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      legend: {
        data: series.map((s) => s.name),
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
      },
      yAxis: {
        type: 'value',
      },
      series,
    };
  };

  const getChartTitle = () => {
    switch (chartType) {
      case 'income':
        return '收入/支出趋势';
      case 'deposit':
        return '存款趋势';
      case 'return':
        return '收益趋势';
      case 'loan':
        return '贷款趋势';
    }
  };

  return (
    <div style={{ height: '400px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>{getChartTitle()}</h3>
        <Select value={chartType} onChange={onChartTypeChange} style={{ width: 120 }}>
          <Option value="income">收入/支出</Option>
          <Option value="deposit">存款</Option>
          <Option value="return">收益</Option>
          <Option value="loan">贷款</Option>
        </Select>
      </div>
      <ReactECharts option={getChartOption()} style={{ height: '350px' }} />
    </div>
  );
};
