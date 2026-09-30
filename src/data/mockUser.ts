import avatarImg from '../assets/images/avatar_aarav_mehta_1790748868096.jpg';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  monthlyBudget: number;
  financialGoal: string;
  currency: string;
  avatarUrl?: string;
  role?: string;
}

export const INITIAL_MOCK_USER: UserProfile = {
  id: "user-001",
  name: "Aarav Mehta",
  email: "aarav.mehta@example.com",
  monthlyIncome: 85000,
  monthlyBudget: 50000,
  financialGoal: "Save more",
  currency: "INR",
  avatarUrl: avatarImg,
  role: "Senior Product Designer"
};
