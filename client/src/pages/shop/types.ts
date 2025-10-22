import type { EquipmentType, OwnedEquipment } from "@shared/schema";

export type UserEquipment = OwnedEquipment & { equipmentType: EquipmentType };

export const tierColors = {
  Basic: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  Gaming: "bg-cyber-blue/20 text-cyber-blue border-cyber-blue/30",
  Professional: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  Enterprise: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  Specialized: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  Server: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ASIC: "bg-neon-orange/20 text-neon-orange border-neon-orange/30",
  "Data Center": "bg-chart-5/20 text-chart-5 border-chart-5/30",
};

export const categoryIcons = {
  "Basic Laptop": "Monitor",
  "Gaming Laptop": "Monitor",
  "Gaming PC": "Cpu",
  "Server Farm": "Server",
  "ASIC Rig": "Boxes",
};

export interface ActivePowerUp {
  id: number;
  type: string;
  boost_percentage: number;
  activated_at: string;
  expires_at: string;
  time_remaining_seconds: number;
}

export interface ActivePowerUpsResponse {
  active_power_ups: ActivePowerUp[];
  effects?: {
    total_hashrate_boost: number;
    total_luck_boost: number;
  };
}

export const TON_PAYMENT_ADDRESS = "UQBdFhwckY9C8MU0AC4uiPbRH_C3QIjZH6OzV47ROfHjnyfe";
