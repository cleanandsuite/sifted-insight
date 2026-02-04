import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Cpu, 
  Apple, 
  Car, 
  Bitcoin, 
  Leaf, 
  Landmark, 
  TrendingUp,
  LayoutGrid 
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'AI', label: 'AI', icon: Cpu },
  { id: 'Apple', label: 'Apple', icon: Apple },
  { id: 'Tesla', label: 'Tesla', icon: Car },
  { id: 'Crypto', label: 'Crypto', icon: Bitcoin },
  { id: 'Climate', label: 'Climate', icon: Leaf },
  { id: 'Politics', label: 'Politics', icon: Landmark },
  { id: 'Finance', label: 'Finance', icon: TrendingUp },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

interface CategoryNavProps {
  variant?: 'horizontal' | 'vertical';
}

export const CategoryNav = ({ variant = 'horizontal' }: CategoryNavProps) => {
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';

  if (variant === 'vertical') {
    return (
      <nav className="border border-border-strong bg-card">
        <div className="p-4 border-b border-border-strong">
          <h3 className="terminal-text font-medium text-foreground">Categories</h3>
        </div>
        <div className="p-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentCategory === cat.id;
            return (
              <Link
                key={cat.id}
                to={cat.id === 'all' ? '/' : `/?category=${cat.id}`}
                className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-card-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide"
    >
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = currentCategory === cat.id;
        return (
          <Link
            key={cat.id}
            to={cat.id === 'all' ? '/' : `/?category=${cat.id}`}
            className={`flex items-center gap-2 px-3 py-1.5 border transition-colors whitespace-nowrap ${
              isActive 
                ? 'border-primary bg-primary text-primary-foreground' 
                : 'border-border-strong hover:bg-card-hover'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{cat.label}</span>
          </Link>
        );
      })}
    </motion.nav>
  );
};
