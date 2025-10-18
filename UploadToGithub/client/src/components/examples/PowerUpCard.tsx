import PowerUpCard from '../PowerUpCard';
import { Zap, Rocket, Shield } from 'lucide-react';

export default function PowerUpCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <PowerUpCard
        name="Hash Overdrive"
        description="Double your mining speed temporarily"
        boost="2x Hashrate"
        duration="1 hour"
        price={1000}
        currency="CS"
        dailyFree={5}
        usedFree={2}
        icon={<Zap className="w-5 h-5 text-neon-orange" />}
      />
      <PowerUpCard
        name="Quantum Boost"
        description="Triple mining output for limited time"
        boost="3x Hashrate"
        duration="30 min"
        price={2500}
        currency="CS"
        dailyFree={0}
        usedFree={0}
        icon={<Rocket className="w-5 h-5 text-cyber-blue" />}
      />
      <PowerUpCard
        name="Network Shield"
        description="Protect against heist events"
        boost="Event immunity"
        duration="24 hours"
        price={0.5}
        currency="TON"
        dailyFree={0}
        usedFree={0}
        icon={<Shield className="w-5 h-5 text-chart-1" />}
      />
    </div>
  );
}
