import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  rewardText: string;
  buttonText: string;
  buttonDisabled?: boolean;
  buttonLoading?: boolean;
  onAction: () => void;
  claimed?: boolean;
  badgeText?: string;
  badgeVariant?: "default" | "outline" | "secondary";
  gradientFrom?: string;
  gradientTo?: string;
  borderColor?: string;
  buttonColor?: string;
}

export default function ActionCard({
  icon: Icon,
  title,
  description,
  rewardText,
  buttonText,
  buttonDisabled = false,
  buttonLoading = false,
  onAction,
  claimed = false,
  badgeText,
  badgeVariant = "default",
  gradientFrom = "orange-500",
  gradientTo = "red-500",
  borderColor = "orange-500",
  buttonColor = "orange-500",
}: ActionCardProps) {
  return (
    <Card className={`p-4 bg-gradient-to-r from-${gradientFrom}/10 to-${gradientTo}/10 border-${borderColor}/30`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${borderColor}`} />
          <h3 className="text-sm md:text-base font-semibold">{title}</h3>
        </div>
        {badgeText && (
          <Badge variant={badgeVariant} className={`text-xs ${claimed ? 'border-green-500 text-green-500' : `bg-${buttonColor}`}`}>
            {badgeText}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xl font-bold text-${borderColor}`}>
            {rewardText}
          </p>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          size="sm"
          onClick={onAction}
          disabled={buttonDisabled || buttonLoading}
          className={`bg-${buttonColor} hover:bg-${buttonColor.replace('-500', '-600')}`}
        >
          {buttonLoading ? "..." : buttonText}
        </Button>
      </div>
    </Card>
  );
}
