export interface IncomeItem {
  id: string;
  name: string;
  amount: number;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
}

export interface MonthlyData {
  id: string;
  year: number;
  month: number;

  // 收入
  salary: number;
  sideJob: number;
  providentFund: number;
  otherIncomes: IncomeItem[];
  totalIncome: number;

  // 支出
  loanRepayment: number;
  otherExpenses: ExpenseItem[];
  totalExpense: number;

  // 净储蓄
  netSavings: number;

  // 资产变动
  newDeposit: number;
  totalDeposit: number;

  pensionContribution: number;
  pensionBalance: number;

  investmentPrincipal: number;
  totalInvestmentPrincipal: number;

  investmentReturn: number;
  totalInvestmentReturn: number;

  // 贷款
  monthlyLoanPayment: number;
  loanBalance: number;

  // 时间戳
  createdAt: number;
  updatedAt: number;
}

export interface InitialAssets {
  deposit: number;
  loan: number;
  pension: number;
  investmentPrincipal: number;
  investmentReturn: number;
}

export type GoalType = 'monthlyDeposit' | 'monthlyRepayment' | 'yearlyDeposit' | 'other';

export interface Goal {
  id: string;
  type: GoalType;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  isInitialized: boolean;
  initialAssets: InitialAssets | null;
  monthlyData: MonthlyData[];
  goals: Goal[];
}
