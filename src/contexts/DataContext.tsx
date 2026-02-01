import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as XLSX from 'xlsx';
import type { MonthlyData, InitialAssets, Goal } from '../types';
import {
  getStoredData,
  initializeApp,
  addMonthlyData,
  deleteMonthlyData,
  addGoal,
  deleteGoal,
  updateGoalProgress,
  clearAllData,
  exportData as exportDataStorage,
  importData as importDataStorage,
} from '../utils/storage';
import { calculateTotalIncome, calculateTotalExpense, calculateNetSavings, generateId } from '../utils/format';

interface DataContextType {
  isInitialized: boolean;
  initialAssets: InitialAssets | null;
  monthlyData: MonthlyData[];
  goals: Goal[];
  loadData: () => void;
  handleInitialize: (assets: InitialAssets) => void;
  handleSaveMonthlyData: (data: Partial<MonthlyData>) => void;
  handleDeleteMonthlyData: (id: string) => void;
  handleAddGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  handleDeleteGoal: (id: string) => void;
  handleClearAllData: () => void;
  handleExportExcel: (year?: number) => void;
  handleImportExcel: (file: File) => Promise<boolean>;
  getCurrentMonthData: () => MonthlyData | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialAssets, setInitialAssets] = useState<InitialAssets | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadData = () => {
    const data = getStoredData();
    setIsInitialized(data.isInitialized);
    setInitialAssets(data.initialAssets);
    setMonthlyData(data.monthlyData);
    setGoals(data.goals);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInitialize = (assets: InitialAssets) => {
    initializeApp(assets);
    loadData();
  };

  const handleSaveMonthlyData = (data: Partial<MonthlyData>) => {
    const now = Date.now();
    const totalIncome = calculateTotalIncome(
      data.salary || 0,
      data.sideJob || 0,
      data.providentFund || 0,
      data.otherIncomes || []
    );
    const totalExpense = calculateTotalExpense(
      data.loanRepayment || 0,
      data.otherExpenses || []
    );
    const netSavings = calculateNetSavings(totalIncome, totalExpense);

    const allocationSum = (data.newDeposit || 0) + (data.pensionContribution || 0) + (data.investmentPrincipal || 0);

    if (Math.abs(netSavings - allocationSum) > 0.01) {
      throw new Error(`净储蓄分配校验失败：净储蓄 ${netSavings} 与分配总和 ${allocationSum} 不一致`);
    }

    const newData: MonthlyData = {
      id: data.id || generateId(),
      year: data.year || new Date().getFullYear(),
      month: data.month || new Date().getMonth() + 1,
      salary: data.salary || 0,
      sideJob: data.sideJob || 0,
      providentFund: data.providentFund || 0,
      otherIncomes: data.otherIncomes || [],
      totalIncome,
      loanRepayment: data.loanRepayment || 0,
      otherExpenses: data.otherExpenses || [],
      totalExpense,
      netSavings,
      newDeposit: data.newDeposit || 0,
      totalDeposit: data.totalDeposit || 0,
      pensionContribution: data.pensionContribution || 0,
      pensionBalance: data.pensionBalance || 0,
      investmentPrincipal: data.investmentPrincipal || 0,
      totalInvestmentPrincipal: data.totalInvestmentPrincipal || 0,
      investmentReturn: data.investmentReturn || 0,
      totalInvestmentReturn: data.totalInvestmentReturn || 0,
      monthlyLoanPayment: data.monthlyLoanPayment || 0,
      loanBalance: data.loanBalance || 0,
      createdAt: data.createdAt || now,
      updatedAt: now,
    };

    addMonthlyData(newData);
    loadData();
  };

  const handleDeleteMonthlyData = (id: string) => {
    deleteMonthlyData(id);
    loadData();
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    addGoal(newGoal);
    loadData();
  };

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id);
    loadData();
  };

  const handleClearAllData = () => {
    clearAllData();
    loadData();
  };

  const handleExportExcel = (year?: number) => {
    let dataToExport = monthlyData;

    if (year) {
      dataToExport = monthlyData.filter((m) => m.year === year);
    }

    const exportData = dataToExport.map((m) => ({
      年份: m.year,
      月份: m.month,
      工资收入: m.salary,
      兼职收入: m.sideJob,
      公积金: m.providentFund,
      其他收入: m.otherIncomes.map((i) => `${i.name}:${i.amount}`).join('; '),
      总收入: m.totalIncome,
      还贷款: m.loanRepayment,
      其他支出: m.otherExpenses.map((e) => `${e.name}:${e.amount}`).join('; '),
      总支出: m.totalExpense,
      净储蓄: m.netSavings,
      新增存款: m.newDeposit,
      累计存款: m.totalDeposit,
      新增养老金: m.pensionContribution,
      累计养老金: m.pensionBalance,
      新增投资本金: m.investmentPrincipal,
      累计投资本金: m.totalInvestmentPrincipal,
      投资收益: m.investmentReturn,
      累计投资收益: m.totalInvestmentReturn,
      本月还款: m.monthlyLoanPayment,
      贷款余额: m.loanBalance,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '记账数据');

    const fileName = year
      ? `记账数据_${year}年.xlsx`
      : `记账数据_全部.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const handleImportExcel = async (file: File): Promise<boolean> => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const importedData: MonthlyData[] = jsonData.map((row: any) => ({
        id: generateId(),
        year: Number(row['年份']),
        month: Number(row['月份']),
        salary: Number(row['工资收入']) || 0,
        sideJob: Number(row['兼职收入']) || 0,
        providentFund: Number(row['公积金']) || 0,
        otherIncomes: [],
        totalIncome: Number(row['总收入']) || 0,
        loanRepayment: Number(row['还贷款']) || 0,
        otherExpenses: [],
        totalExpense: Number(row['总支出']) || 0,
        netSavings: Number(row['净储蓄']) || 0,
        newDeposit: Number(row['新增存款']) || 0,
        totalDeposit: Number(row['累计存款']) || 0,
        pensionContribution: Number(row['新增养老金']) || 0,
        pensionBalance: Number(row['累计养老金']) || 0,
        investmentPrincipal: Number(row['新增投资本金']) || 0,
        totalInvestmentPrincipal: Number(row['累计投资本金']) || 0,
        investmentReturn: Number(row['投资收益']) || 0,
        totalInvestmentReturn: Number(row['累计投资收益']) || 0,
        monthlyLoanPayment: Number(row['本月还款']) || 0,
        loanBalance: Number(row['贷款余额']) || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));

      const allData = [...monthlyData];
      importedData.forEach((imported) => {
        const existingIndex = allData.findIndex(
          (m) => m.year === imported.year && m.month === imported.month
        );
        if (existingIndex >= 0) {
          allData[existingIndex] = imported;
        } else {
          allData.push(imported);
        }
      });

      allData.sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

      const currentData = getStoredData();
      currentData.monthlyData = allData;
      importDataStorage(currentData);
      loadData();

      return true;
    } catch (error) {
      console.error('导入失败:', error);
      return false;
    }
  };

  const getCurrentMonthData = (): MonthlyData | null => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    return (
      monthlyData.find((m) => m.year === year && m.month === month) || null
    );
  };

  return (
    <DataContext.Provider
      value={{
        isInitialized,
        initialAssets,
        monthlyData,
        goals,
        loadData,
        handleInitialize,
        handleSaveMonthlyData,
        handleDeleteMonthlyData,
        handleAddGoal,
        handleDeleteGoal,
        handleClearAllData,
        handleExportExcel,
        handleImportExcel,
        getCurrentMonthData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
