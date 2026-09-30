import { UserProfile, INITIAL_MOCK_USER } from '../data/mockUser';

export async function loginUser(email: string, _pass: string): Promise<UserProfile> {
  await new Promise(res => setTimeout(res, 400));
  // If email matches demo user or any test email, authenticate
  if (email.toLowerCase().includes('aarav') || email.toLowerCase().includes('demo')) {
    return { ...INITIAL_MOCK_USER };
  }
  return {
    ...INITIAL_MOCK_USER,
    email,
    name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  };
}

export async function signupUser(data: {
  name: string;
  email: string;
  password?: string;
}): Promise<UserProfile> {
  await new Promise(res => setTimeout(res, 400));
  return {
    id: `user-${Date.now().toString().slice(-4)}`,
    name: data.name,
    email: data.email,
    monthlyIncome: 85000,
    monthlyBudget: 50000,
    financialGoal: "Save more",
    currency: "INR",
    avatarUrl: "/src/assets/images/avatar_aarav_mehta_1790748868096.jpg"
  };
}
