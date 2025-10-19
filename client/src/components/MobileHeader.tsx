import { Terminal, Gem } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border md:hidden">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-matrix-green/20 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-matrix-green" />
          </div>
          <div>
            <h2 className="font-bold text-xs">Crypto Hacker Heist</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-matrix-green/10 border border-matrix-green/30">
            <Gem className="w-3.5 h-3.5 text-matrix-green" />
            <span className="text-xs font-bold font-mono text-matrix-green">45,280</span>
          </div>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Phase 1
          </Badge>
        </div>
      </div>
    </header>
  );
}
