export interface CategoryInfo {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  keywords: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'Food',
    name: 'Food',
    color: '#F97316', // Orange
    bgColor: '#FFF7ED',
    keywords: ['swiggy', 'zomato', 'restaurant', 'cafe', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'biryani', 'chai', 'coffee', 'starbucks', 'mcdonalds', 'kfc', 'subway', 'haldiram', 'food']
  },
  {
    id: 'Transport',
    name: 'Transport',
    color: '#0284C7', // Sky Blue
    bgColor: '#F0F9FF',
    keywords: ['uber', 'ola', 'metro', 'petrol', 'fuel', 'parking', 'indigo', 'fastag', 'toll', 'auto', 'bus', 'cab', 'rapido', 'railway', 'irctc']
  },
  {
    id: 'Shopping',
    name: 'Shopping',
    color: '#8B5CF6', // Purple
    bgColor: '#F5F3FF',
    keywords: ['amazon', 'flipkart', 'myntra', 'mall', 'clothing', 'electronics', 'zara', 'h&m', 'ajio', 'croma', 'reliance digital', 'nykaa', 'tata cliq', 'shoes', 'watch', 'shopping']
  },
  {
    id: 'Entertainment',
    name: 'Entertainment',
    color: '#EC4899', // Pink
    bgColor: '#FDF2F8',
    keywords: ['netflix', 'spotify', 'bookmyshow', 'movie', 'theatre', 'game', 'pvr', 'inox', 'youtube', 'prime video', 'hotstar', 'steam', 'playstation', 'cinema']
  },
  {
    id: 'Healthcare',
    name: 'Healthcare',
    color: '#10B981', // Emerald
    bgColor: '#ECFDF5',
    keywords: ['apollo', 'pharmacy', 'hospital', 'doctor', 'medicine', 'medplus', '1mg', 'practo', 'diagnostic', 'clinic', 'dentist', 'health', 'consultation']
  },
  {
    id: 'Education',
    name: 'Education',
    color: '#3B82F6', // Blue
    bgColor: '#EFF6FF',
    keywords: ['course', 'udemy', 'book', 'college', 'tuition', 'coursera', 'kindle', 'school', 'seminar', 'workshop', 'learning', 'training']
  },
  {
    id: 'Bills',
    name: 'Bills',
    color: '#6366F1', // Indigo
    bgColor: '#EEF2FF',
    keywords: ['electricity', 'broadband', 'rent', 'insurance', 'maintenance', 'bescom', 'tata power', 'lic', 'hdfc ergo', 'bill', 'society', 'dth']
  },
  {
    id: 'Travel',
    name: 'Travel',
    color: '#14B8A6', // Teal
    bgColor: '#F0FDFA',
    keywords: ['hotel', 'flight', 'airbnb', 'trip', 'booking', 'makemytrip', 'goibibo', 'resort', 'cleartrip', 'vacation', 'air india', 'vistara']
  },
  {
    id: 'Groceries',
    name: 'Groceries',
    color: '#84CC16', // Lime
    bgColor: '#F7FEE7',
    keywords: ['dmart', 'reliance fresh', 'blinkit', 'bigbasket', 'grocery', 'zepto', 'nature basket', 'supermarket', 'vegetables', 'fruits', 'milk']
  },
  {
    id: 'Utilities',
    name: 'Utilities',
    color: '#EAB308', // Amber
    bgColor: '#FEFCE8',
    keywords: ['recharge', 'mobile', 'internet', 'gas', 'water', 'jio recharge', 'airtel', 'vi recharge', 'indane', 'piped gas', 'cylinder']
  },
  {
    id: 'Other',
    name: 'Other',
    color: '#64748B', // Slate
    bgColor: '#F8FAFC',
    keywords: ['miscellaneous', 'atm withdrawal', 'cash transfer', 'pos-4581', 'general', 'personal', 'unknown']
  }
];

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

export function getCategoryMeta(categoryName: string): CategoryInfo {
  const found = CATEGORIES.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
  return found || CATEGORIES[CATEGORIES.length - 1]; // Fallback to 'Other'
}
