import type { AppData, InitialAssets, MonthlyData, Goal } from '../types';

const STORAGE_KEY = 'accounting_data';

export const getStoredData = (): AppData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        isInitialized: false,
        initialAssets: null,
        monthlyData: [],
        goals: [],
      };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('读取数据失败:', error);
    return {
      isInitialized: false,
      initialAssets: null,
      monthlyData: [],
      goals: [],
    };
  }
};

export const saveStoredData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('保存数据失败:', error);
  }
};

export const initializeApp = (initialAssets: InitialAssets): void => {
  const data = getStoredData();
  data.isInitialized = true;
  data.initialAssets = initialAssets;
  saveStoredData(data);
};

export const getMonthlyData = (): MonthlyData[] => {
  const data = getStoredData();
  return data.monthlyData || [];
};

export const saveMonthlyData = (monthlyData: MonthlyData[]): void => {
  const data = getStoredData();
  data.monthlyData = monthlyData;
  saveStoredData(data);
};

export const addMonthlyData = (monthData: MonthlyData): void => {
  const data = getStoredData();
  const existingIndex = data.monthlyData.findIndex(
    (m) => m.year === monthData.year && m.month === monthData.month
  );

  if (existingIndex >= 0) {
    data.monthlyData[existingIndex] = monthData;
  } else {
    data.monthlyData.push(monthData);
  }

  data.monthlyData.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  saveStoredData(data);
};

export const deleteMonthlyData = (id: string): void => {
  const data = getStoredData();
  data.monthlyData = data.monthlyData.filter((m) => m.id !== id);
  saveStoredData(data);
};

export const getGoals = (): Goal[] => {
  const data = getStoredData();
  return data.goals || [];
};

export const saveGoals = (goals: Goal[]): void => {
  const data = getStoredData();
  data.goals = goals;
  saveStoredData(data);
};

export const addGoal = (goal: Goal): void => {
  const data = getStoredData();
  data.goals.push(goal);
  saveStoredData(data);
};

export const deleteGoal = (id: string): void => {
  const data = getStoredData();
  data.goals = data.goals.filter((g) => g.id !== id);
  saveStoredData(data);
};

export const updateGoalProgress = (id: string, currentAmount: number): void => {
  const data = getStoredData();
  const goal = data.goals.find((g) => g.id === id);
  if (goal) {
    goal.currentAmount = currentAmount;
    goal.updatedAt = Date.now();
    saveStoredData(data);
  }
};

export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const exportData = (): AppData => {
  return getStoredData();
};

export const importData = (data: AppData): boolean => {
  try {
    saveStoredData(data);
    return true;
  } catch (error) {
    console.error('导入数据失败:', error);
    return false;
  }
};
