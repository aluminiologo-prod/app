import {
  Boxes,
  Briefcase,
  Building,
  Building2,
  Crown,
  Drill,
  Factory,
  Hammer,
  HardHat,
  Home,
  LayoutGrid,
  PaintBucket,
  Package,
  Package2,
  Ruler,
  Scissors,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  SquareStack,
  Star,
  Store,
  Tag,
  Truck,
  User,
  Users,
  Wand2,
  Warehouse,
  Wrench,
} from 'lucide-react-native';
import type { ComponentType } from 'react';

type IconComponent = ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

/**
 * Mobile-side mirror of `aluminiologo-frontend/src/lib/iconRegistry.ts`.
 * Both files MUST expose the exact same keys so that a string stored as
 * `client_types.icon_name` renders the same glyph on both platforms.
 * When adding/removing an icon, update BOTH registries in the same commit.
 */
export const ICON_REGISTRY: Record<string, IconComponent> = {
  wrench: Wrench,
  hammer: Hammer,
  'hard-hat': HardHat,
  drill: Drill,
  ruler: Ruler,
  scissors: Scissors,
  'paint-bucket': PaintBucket,
  'layout-grid': LayoutGrid,
  'square-stack': SquareStack,
  package: Package,
  'package-2': Package2,
  boxes: Boxes,
  warehouse: Warehouse,
  factory: Factory,
  truck: Truck,
  store: Store,
  'shopping-bag': ShoppingBag,
  'shopping-cart': ShoppingCart,
  tag: Tag,
  briefcase: Briefcase,
  building: Building,
  'building-2': Building2,
  home: Home,
  user: User,
  users: Users,
  star: Star,
  crown: Crown,
  shield: Shield,
  sparkles: Sparkles,
  'wand-2': Wand2,
};

/**
 * Resolve a stored icon name to a lucide component. Falls back to `User` so
 * callers can always render something (legacy rows with a NULL or unknown
 * icon_name won't blow up the UI).
 */
export function resolveIcon(name: string | null | undefined): IconComponent {
  if (!name) return User;
  return ICON_REGISTRY[name] ?? User;
}
