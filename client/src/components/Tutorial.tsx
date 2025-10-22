import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Cpu, ShoppingBag, Wallet, Zap, Gift, Target,
  Trophy, Disc3, ArrowRight, ArrowLeft, CheckCircle
} from "lucide-react";

interface TutorialProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    title: "Welcome to Crypto Hacker Heist! 🎮",
    icon: Cpu,
    description: "You're about to become the ultimate crypto mining tycoon! Let's get you started with a quick tour.",
    tip: "Complete this tutorial to earn 5,000 CS bonus!",
    color: "text-matrix-green",
  },
  {
    title: "Dashboard - Your Command Center",
    icon: Cpu,
    description: "Track your CS & CHST balance, total hashrate, and active mining rigs. This is your home base where you'll see all your stats and progress.",
    tip: "Check your dashboard daily for streak bonuses!",
    color: "text-matrix-green",
  },
  {
    title: "Shop - Buy Mining Rigs",
    icon: ShoppingBag,
    description: "Purchase equipment from Basic PCs to Data Centers! Each rig generates hashrate which mines blocks and earns you CS currency automatically.",
    tip: "Start with Basic or Gaming tier rigs. Upgrade components for more power!",
    color: "text-cyber-blue",
  },
  {
    title: "Rigs - Manage Your Equipment",
    icon: Cpu,
    description: "View all your mining equipment, upgrade components (CPU, GPU, RAM, Storage), and manage your mining empire. Better components = more hashrate!",
    tip: "Component upgrades can be paid with CS, CHST, or TON!",
    color: "text-purple-500",
  },
  {
    title: "Wallet - Connect TON",
    icon: Wallet,
    description: "Connect your TON wallet to make purchases with real crypto! Buy loot boxes, power-ups, premium features, and enter the spin wheel jackpot.",
    tip: "TON payments unlock premium features and the 1 TON jackpot!",
    color: "text-blue-500",
  },
  {
    title: "Power-Ups & Boosts",
    icon: Zap,
    description: "Activate temporary boosts! Daily free currency claims give you CS/CHST. Premium power-ups bought with TON boost your hashrate (+50%) or luck (+20%) for 1 hour.",
    tip: "Power-ups stack with your equipment for massive gains!",
    color: "text-yellow-500",
  },
  {
    title: "Loot Boxes - Random Rewards",
    icon: Gift,
    description: "Open mystery boxes for CS, CHST, and bonus items! Basic (0.5 TON), Premium (2 TON), or Epic (5 TON) boxes. 100-110% RTP guaranteed!",
    tip: "Free boxes available from daily tasks and referrals!",
    color: "text-pink-500",
  },
  {
    title: "Spin Wheel - Win Big!",
    icon: Disc3,
    description: "1 free spin daily + buy extras with TON! Win CS, CHST, power-ups, equipment, and the GRAND PRIZE: 1 TON jackpot (0.1% chance)!",
    tip: "Bulk purchases save money: 10 spins = 10% off, 20 spins = 15% off!",
    color: "text-purple-500",
  },
  {
    title: "Challenges & Achievements",
    icon: Target,
    description: "Complete daily challenges for rewards! Unlock achievements for bonus CS and CHST. Track your progress and maximize earnings.",
    tip: "Challenges reset at midnight UTC - complete them all!",
    color: "text-orange-500",
  },
  {
    title: "Ready to Mine! 💰",
    icon: Trophy,
    description: "You're all set! Start by buying your first rig in the Shop, then watch your crypto empire grow. Complete challenges, spin the wheel, and climb the leaderboard!",
    tip: "Remember: Better equipment = More hashrate = More CS earned!",
    color: "text-matrix-green",
  },
];

export function Tutorial({ open, onComplete, onSkip }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="bg-matrix-green/20 text-matrix-green">
              Tutorial
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {tutorialSteps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2 mb-4" />
        </DialogHeader>

        {/* Step Content */}
        <div className="space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-matrix-green/20 to-cyber-blue/20 flex items-center justify-center`}>
              <Icon className={`w-10 h-10 ${step.color}`} />
            </div>
          </div>

          {/* Title */}
          <DialogTitle className="text-center text-2xl">
            {step.title}
          </DialogTitle>

          {/* Description */}
          <p className="text-center text-muted-foreground">
            {step.description}
          </p>

          {/* Tip */}
          <div className="p-3 bg-matrix-green/10 rounded-lg border border-matrix-green/30">
            <p className="text-sm text-center">
              💡 <strong>Pro Tip:</strong> {step.tip}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Skip Button - only show on first few steps */}
          {currentStep < tutorialSteps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="sm:flex-1"
            >
              Skip Tutorial
            </Button>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2 w-full sm:flex-1">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              className={`flex-1 ${
                currentStep === tutorialSteps.length - 1
                  ? 'bg-matrix-green hover:bg-matrix-green/90 text-black'
                  : 'bg-cyber-blue hover:bg-cyber-blue/90'
              }`}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  Finish & Claim 5,000 CS
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
