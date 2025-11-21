import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Tool {
  id: number;
  name: string;
  description: string;
  price: number;
  priceUnit: string;
  location: string;
  category: string;
  condition: string;
  status: string;
  owner: string;
  rating: number;
  reviews: number;
  lastSeen: string;
  image: string;
  isFavorite: boolean;
  hasDelivery?: boolean;
  deliveryPrice?: number;
}

interface ComparisonContextType {
  comparisonList: Tool[];
  addToComparison: (tool: Tool) => boolean;
  removeFromComparison: (toolId: number) => void;
  clearComparison: () => void;
  isInComparison: (toolId: number) => boolean;
  comparisonCount: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonList, setComparisonList] = useState<Tool[]>([]);

  useEffect(() => {
    // Load comparison list from localStorage on mount
    const savedComparison = localStorage.getItem('tool-comparison');
    if (savedComparison) {
      try {
        setComparisonList(JSON.parse(savedComparison));
      } catch (error) {
        console.error('Error loading comparison list:', error);
        localStorage.removeItem('tool-comparison');
      }
    }
  }, []);

  const addToComparison = (tool: Tool) => {
    if (comparisonList.length >= 3) {
      return false; // Maximum 3 tools
    }
    
    if (comparisonList.some(t => t.id === tool.id)) {
      return false; // Tool already in comparison
    }

    const newList = [...comparisonList, tool];
    setComparisonList(newList);
    localStorage.setItem('tool-comparison', JSON.stringify(newList));
    return true;
  };

  const removeFromComparison = (toolId: number) => {
    const newList = comparisonList.filter(tool => tool.id !== toolId);
    setComparisonList(newList);
    localStorage.setItem('tool-comparison', JSON.stringify(newList));
  };

  const clearComparison = () => {
    setComparisonList([]);
    localStorage.removeItem('tool-comparison');
  };

  const isInComparison = (toolId: number) => {
    return comparisonList.some(tool => tool.id === toolId);
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonList,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      comparisonCount: comparisonList.length,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
