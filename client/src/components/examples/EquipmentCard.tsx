import EquipmentCard from '../EquipmentCard';
import { Cpu, Monitor, Server, Boxes } from 'lucide-react';

export default function EquipmentCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <EquipmentCard
        name="Lenovo ThinkPad E14"
        tier="basic"
        hashrate={50}
        price={5000}
        owned={1}
        maxOwned={10}
        currency="CS"
        icon={<Monitor className="w-5 h-5 text-chart-1" />}
      />
      <EquipmentCard
        name="Acer Predator Helios"
        tier="gaming"
        hashrate={350}
        price={25000}
        owned={0}
        maxOwned={10}
        currency="CS"
        icon={<Cpu className="w-5 h-5 text-cyber-blue" />}
      />
      <EquipmentCard
        name="VIXIA High-End i9"
        tier="pc"
        hashrate={1200}
        price={120000}
        owned={0}
        maxOwned={25}
        currency="CS"
        icon={<Server className="w-5 h-5 text-chart-2" />}
      />
      <EquipmentCard
        name="Bitmain Antminer S21"
        tier="asic"
        hashrate={50000}
        price={5}
        owned={0}
        maxOwned={50}
        currency="TON"
        locked={true}
        icon={<Boxes className="w-5 h-5 text-neon-orange" />}
      />
    </div>
  );
}
