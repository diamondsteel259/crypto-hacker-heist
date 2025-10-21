import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Palette, Check, ShoppingCart, Sparkles } from "lucide-react";
import { initializeUser } from "@/lib/user";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { sendTonTransaction, isWalletConnected, getTonConnectUI } from "@/lib/tonConnect";

const TON_PAYMENT_ADDRESS = "UQBdFhwckY9C8MU0AC4uiPbRH_C3QIjZH6OzV47ROfHjnyfe";

interface CosmeticItem {
  id: number;
  itemId: string;
  name: string;
  description: string | null;
  category: string;
  priceCs: number | null;
  priceChst: number | null;
  priceTon: string | null;
  imageUrl: string | null;
  isAnimated: boolean;
  isActive: boolean;
  orderIndex: number;
}

interface UserCosmetic {
  id: number;
  userId: string;
  cosmeticId: string;
  purchasedAt: string;
  isEquipped: boolean;
}

export default function Cosmetics() {
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("background");

  useEffect(() => {
    initializeUser()
      .then(setUserId)
      .catch(err => console.error('Failed to initialize user:', err));
  }, []);

  const { data: allCosmetics, isLoading: cosmeticsLoading } = useQuery<CosmeticItem[]>({
    queryKey: ['/api/cosmetics'],
  });

  const { data: ownedCosmetics, isLoading: ownedLoading } = useQuery<UserCosmetic[]>({
    queryKey: ['/api/user', userId, 'cosmetics'],
    enabled: !!userId,
  });

  const purchaseMutation = useMutation({
    mutationFn: async ({ cosmeticId, currency, tonData }: any) => {
      const body: any = { currency };
      if (currency === 'TON' && tonData) {
        body.tonTransactionHash = tonData.txHash;
        body.userWalletAddress = tonData.userWallet;
        body.tonAmount = tonData.amount;
      }

      const response = await apiRequest('POST', `/api/user/${userId}/cosmetics/${cosmeticId}/purchase`, body);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId, 'cosmetics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user', userId] });
      toast({
        title: "Purchase Successful!",
        description: data.message || "Cosmetic item purchased!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase cosmetic",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = async (item: CosmeticItem) => {
    // Determine which currency to use
    let currency = 'CS';
    if (item.priceTon && !item.priceCs && !item.priceChst) {
      currency = 'TON';
    } else if (item.priceChst && !item.priceCs) {
      currency = 'CHST';
    }

    if (currency === 'TON' && item.priceTon) {
      // Handle TON payment
      if (!isWalletConnected()) {
        const tonConnectUI = getTonConnectUI();
        await tonConnectUI.openModal();
        return;
      }

      try {
        const txHash = await sendTonTransaction(TON_PAYMENT_ADDRESS, item.priceTon, `Cosmetic: ${item.name}`);
        
        if (txHash) {
          purchaseMutation.mutate({
            cosmeticId: item.itemId,
            currency: 'TON',
            tonData: { txHash },
          });
        } else {
          throw new Error("Transaction cancelled");
        }
      } catch (error: any) {
        toast({
          title: "Transaction Failed",
          description: error.message || "Failed to send TON transaction",
          variant: "destructive",
        });
      }
    } else {
      // CS or CHST purchase
      purchaseMutation.mutate({
        cosmeticId: item.itemId,
        currency,
      });
    }
  };

  if (cosmeticsLoading || ownedLoading) {
    return (
      <div className="min-h-screen bg-background p-3">
        <div className="max-w-6xl mx-auto">
          <Card className="p-6">
            <p className="text-muted-foreground">Loading cosmetics shop...</p>
          </Card>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'background', name: 'Backgrounds', icon: '🎨' },
    { id: 'nameColor', name: 'Name Colors', icon: '✨' },
    { id: 'badge', name: 'Badges', icon: '🏅' },
  ];

  const filteredCosmetics = allCosmetics?.filter(c => c.category === selectedCategory) || [];
  const ownedIds = ownedCosmetics?.map(o => o.cosmeticId) || [];

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Cosmetics Shop</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Customize your profile with unique items
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Owned Items</p>
              <p className="text-2xl font-bold">{ownedCosmetics?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Available</p>
              <p className="text-2xl font-bold">{allCosmetics?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Collection</p>
              <p className="text-2xl font-bold">
                {allCosmetics && allCosmetics.length > 0
                  ? Math.round(((ownedCosmetics?.length || 0) / allCosmetics.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="lg"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Cosmetics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCosmetics.map((item) => {
            const isOwned = ownedIds.includes(item.itemId);

            return (
              <Card
                key={item.itemId}
                className={`p-4 transition-all ${
                  isOwned
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50'
                    : 'hover:border-primary'
                }`}
              >
                {/* Preview Area */}
                <div className="relative aspect-video rounded-lg mb-3 overflow-hidden bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  {item.isAnimated && (
                    <Badge className="absolute top-2 right-2 bg-purple-500">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Animated
                    </Badge>
                  )}
                  {isOwned && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-green-500">
                        <Check className="w-3 h-3 mr-1" />
                        Owned
                      </Badge>
                    </div>
                  )}

                  {/* Preview based on category */}
                  {item.category === 'background' && (
                    <div className="text-4xl">🎨</div>
                  )}
                  {item.category === 'nameColor' && (
                    <div className="text-2xl font-bold" style={{
                      color: item.itemId.includes('green') ? '#00ff00' :
                             item.itemId.includes('blue') ? '#0088ff' :
                             item.itemId.includes('gold') ? '#ffd700' : '#ff00ff'
                    }}>
                      {item.name}
                    </div>
                  )}
                  {item.category === 'badge' && (
                    <div className="text-4xl">🏅</div>
                  )}
                </div>

                {/* Item Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-base mb-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                </div>

                {/* Price & Purchase */}
                {isOwned ? (
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    disabled
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Owned
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {item.priceCs && (
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(item)}
                        disabled={purchaseMutation.isPending}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {item.priceCs.toLocaleString()} CS
                      </Button>
                    )}
                    {item.priceChst && !item.priceCs && (
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => handlePurchase(item)}
                        disabled={purchaseMutation.isPending}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {item.priceChst} CHST
                      </Button>
                    )}
                    {item.priceTon && !item.priceCs && !item.priceChst && (
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        onClick={() => handlePurchase(item)}
                        disabled={purchaseMutation.isPending}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {item.priceTon} TON
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {filteredCosmetics.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              No cosmetics available in this category yet.
            </p>
          </Card>
        )}

        {/* Info Card */}
        <Card className="p-4 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Cosmetic items are permanent once purchased. Show off your collection and stand out from the crowd!
          </p>
        </Card>
      </div>
    </div>
  );
}
