import React, { useState } from 'react';
import { Card, Row, Col, Button, Select, Modal, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined, ExportOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { formatPercent, calculateSavingsRate } from '../utils/format';
import type { MonthlyData } from '../types';

const { Option } = Select;

export const History = () => {
  const navigate = useNavigate();
  const { monthlyData, handleDeleteMonthlyData, handleExportExcel } = useData();
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedData, setSelectedData] = useState<MonthlyData | null>(null);

  const years = Array.from(new Set(monthlyData.map((m) => m.year))).sort();

  const filteredData = selectedYear === 'all' ? monthlyData : monthlyData.filter((m) => m.year === selectedYear);

  const handleEdit = (data: MonthlyData) => {
    navigate(`/entry?year=${data.year}&month=${data.month}`);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      onOk: () => {
        handleDeleteMonthlyData(id);
        message.success('删除成功');
      },
    });
  };

  const handleShowDetail = (data: MonthlyData) => {
    setSelectedData(data);
    setDetailModalVisible(true);
  };

  const handleExport = (data: MonthlyData) => {
    handleExportExcel(data.year);
  };

  const handleExportAll = () => {
    handleExportExcel();
  };

  return (
    <div style={{ padding: '24px' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>历史记录</h1>
        <Space>
          <Select value={selectedYear} onChange={setSelectedYear} style={{ width: 120 }}>
            <Option value="all">全部</Option>
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}年
              </Option>
            ))}
          </Select>
          <Button icon={<ExportOutlined />} onClick={handleExportAll}>
            导出全部
          </Button>
        </Space>
      </Row>

      <Row gutter={[16, 16]}>
        {filteredData.map((data) => (
          <Col key={data.id} xs={24} sm={12} md={8}>
            <Card
              title={`${data.year}年 ${data.month}月`}
              extra={
                <Space>
                  <Button
                    type="text"
                    icon={<CalendarOutlined />}
                    onClick={() => handleShowDetail(data)}
                  >
                    明细
                  </Button>
                </Space>
              }
              hoverable
              style={{ height: '100%' }}
            >
              <div style={{ marginBottom: 12 }}>
                <div>收入：¥{data.totalIncome.toFixed(2)}</div>
                <div>支出：¥{data.totalExpense.toFixed(2)}</div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div>净储蓄：¥{data.netSavings.toFixed(2)}</div>
                <div>
                  储蓄率：{formatPercent(calculateSavingsRate(data.netSavings, data.totalIncome))}
                </div>
              </div>

              <div>投资收益：¥{data.investmentReturn.toFixed(2)}</div>

              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Space>
                  <Button
                    type="text"
                    icon={<ExportOutlined />}
                    onClick={() => handleExport(data)}
                  >
                    导出
                  </Button>
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(data)}
                  >
                    编辑
                  </Button>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(data.id)}
                  >
                    删除
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px', color: '#999' }}>
          暂无记录
        </div>
      )}

      <Modal
        title={`${selectedData?.year}年 ${selectedData?.month}月 明细`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedData && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>收入</h3>
              <div>工资收入：¥{selectedData.salary.toFixed(2)}</div>
              <div>兼职收入：¥{selectedData.sideJob.toFixed(2)}</div>
              <div>公积金：¥{selectedData.providentFund.toFixed(2)}</div>
              {selectedData.otherIncomes.length > 0 && (
                <div>
                  其他收入：
                  {selectedData.otherIncomes.map((item, index) => (
                    <div key={index} style={{ marginLeft: 16 }}>
                      {item.name}：¥{item.amount.toFixed(2)}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>
                总收入：¥{selectedData.totalIncome.toFixed(2)}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>支出</h3>
              <div>还贷款：¥{selectedData.loanRepayment.toFixed(2)}</div>
              {selectedData.otherExpenses.length > 0 && (
                <div>
                  其他支出：
                  {selectedData.otherExpenses.map((item, index) => (
                    <div key={index} style={{ marginLeft: 16 }}>
                      {item.name}：¥{item.amount.toFixed(2)}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ fontWeight: 'bold', marginTop: 8 }}>
                总支出：¥{selectedData.totalExpense.toFixed(2)}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>资产变动</h3>
              <div>新增存款：¥{selectedData.newDeposit.toFixed(2)}</div>
              <div>累计存款：¥{selectedData.totalDeposit.toFixed(2)}</div>
              <div>新增养老金：¥{selectedData.pensionContribution.toFixed(2)}</div>
              <div>累计养老金：¥{selectedData.pensionBalance.toFixed(2)}</div>
              <div>新增投资本金：¥{selectedData.investmentPrincipal.toFixed(2)}</div>
              <div>累计投资本金：¥{selectedData.totalInvestmentPrincipal.toFixed(2)}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h3>投资</h3>
              <div>当月收益：¥{selectedData.investmentReturn.toFixed(2)}</div>
              <div>累计收益：¥{selectedData.totalInvestmentReturn.toFixed(2)}</div>
            </div>

            <div>
              <h3>贷款</h3>
              <div>本月还款：¥{selectedData.monthlyLoanPayment.toFixed(2)}</div>
              <div>贷款余额：¥{selectedData.loanBalance.toFixed(2)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
