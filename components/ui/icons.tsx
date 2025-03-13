import {
  Users,
  Shuffle,
  Settings,
  User,
  Trophy,
  ArrowRight,
  type LucideIcon
} from "lucide-react";

export type IconName = "users" | "shuffle" | "settings" | "user" | "trophy" | "arrow-right";

const iconMap: Record<IconName, LucideIcon> = {
  users: Users,
  shuffle: Shuffle,
  settings: Settings,
  user: User,
  trophy: Trophy,
  "arrow-right": ArrowRight,
};

interface IconsProps extends React.HTMLAttributes<SVGElement> {
  name: IconName;
}

export function Icons({ name, ...props }: IconsProps) {
  const Icon = iconMap[name];
  return <Icon {...props} />;
} 