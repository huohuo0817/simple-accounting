import dayjs from 'dayjs';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(num);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatDate = (timestamp: number): string => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

export const formatDateKey = (year: number, month: number): string => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const calculateNetSavings = (income: number, expense: number): number => {
  return income - expense;
};

export const calculateTotalIncome = (
  salary: number,
  sideJob: number,
  providentFund: number,
  otherIncomes: Array<{ amount: number }>
): number => {
  return salary + sideJob + providentFund + otherIncomes.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateTotalExpense = (
  loanRepayment: number,
  otherExpenses: Array<{ amount: number }>
): number => {
  return loanRepayment + otherExpenses.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateSavingsRate = (netSavings: number, totalIncome: number): number => {
  if (totalIncome === 0) return 0;
  return (netSavings / totalIncome) * 100;
};

export const calculateAnnualizedReturn = (
  totalReturn: number,
  totalPrincipal: number
): number => {
  if (totalPrincipal === 0) return 0;
  return (totalReturn / totalPrincipal) * 100;
};

export const calculateCumulativeData = (
  monthlyData: Array<{ newDeposit: number; pensionContribution: number; investmentPrincipal: number; investmentReturn: number; monthlyLoanPayment: number }>,
  initialAssets: { deposit: number; pension: number; investmentPrincipal: number; investmentReturn: number }
) => {
  let cumulativeDeposit = initialAssets.deposit;
  let cumulativePension = initialAssets.pension;
  let cumulativePrincipal = initialAssets.investmentPrincipal;
  let cumulativeReturn = initialAssets.investmentReturn;
  let cumulativeLoanPayment = 0;

  return monthlyData.map((m) => {
    cumulativeDeposit += m.newDeposit;
    cumulativePension += m.pensionContribution;
    cumulativePrincipal += m.investmentPrincipal;
    cumulativeReturn += m.investmentReturn;
    cumulativeLoanPayment += m.monthlyLoanPayment;

    return {
      cumulativeDeposit,
      cumulativePension,
      cumulativePrincipal,
      cumulativeReturn,
      cumulativeLoanPayment,
    };
  });
};

export const getCurrentDateKey = (): string => {
  return dayjs().format('YYYY-MM');
};
