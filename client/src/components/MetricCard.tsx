import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  loading?: boolean;
  iconColor?: string;
  valueColor?: string;
  glow?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  subtitle,
  loading = false,
  iconColor = "text-matrix-green",
  valueColor = "text-foreground",
  glow = false,
  size = "md",
}: MetricCardProps) {
  const sizeClasses = {
    sm: {
      container: "p-3",
      icon: "w-4 h-4",
      label: "text-xs",
      value: "text-lg md:text-xl",
      subtitle: "text-[10px]",
    },
    md: {
      container: "p-4",
      icon: "w-5 h-5",
      label: "text-sm",
      value: "text-2xl md:text-3xl",
      subtitle: "text-xs",
    },
    lg: {
      container: "p-6",
      icon: "w-6 h-6",
      label: "text-base",
      value: "text-3xl md:text-4xl lg:text-5xl",
      subtitle: "text-sm",
    },
  };

  const classes = sizeClasses[size];

  return (
    <Card className={`${classes.container} hover:border-matrix-green/50 transition-all ${glow ? 'stat-glow-green' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`${classes.icon} ${iconColor}`} />
        <p className={`${classes.label} font-medium text-muted-foreground uppercase tracking-wider`}>
          {label}
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-9 w-32" />
      ) : (
        <p className={`${classes.value} font-bold font-mono ${valueColor} ${glow ? 'matrix-glow' : ''}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      )}
      {subtitle && (
        <p className={`${classes.subtitle} text-muted-foreground mt-1`}>
          {subtitle}
        </p>
      )}
    </Card>
  );
}
