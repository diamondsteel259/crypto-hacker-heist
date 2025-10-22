/**
 * Button component with haptic feedback
 * Wraps the standard Button component and adds Telegram haptic feedback
 */
import { Button, type ButtonProps } from "@/components/ui/button";
import { hapticLight, hapticMedium, hapticHeavy } from "@/lib/telegram";
import { forwardRef } from "react";

interface HapticButtonProps extends ButtonProps {
  hapticStyle?: 'light' | 'medium' | 'heavy';
}

export const HapticButton = forwardRef<HTMLButtonElement, HapticButtonProps>(
  ({ onClick, hapticStyle = 'light', ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Trigger haptic feedback
      if (hapticStyle === 'light') hapticLight();
      else if (hapticStyle === 'medium') hapticMedium();
      else if (hapticStyle === 'heavy') hapticHeavy();

      // Call original onClick
      if (onClick) onClick(e);
    };

    return <Button ref={ref} onClick={handleClick} {...props} />;
  }
);

HapticButton.displayName = "HapticButton";
