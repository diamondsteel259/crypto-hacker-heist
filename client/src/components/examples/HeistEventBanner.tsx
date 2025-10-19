import HeistEventBanner from '../HeistEventBanner';

export default function HeistEventBannerExample() {
  return (
    <div className="space-y-4 p-4">
      <HeistEventBanner
        type="bonus"
        message="Double mining rewards for all blocks! Hash faster while it lasts."
        timeLeft="45:23"
      />
      <HeistEventBanner
        type="penalty"
        message="Network congestion detected. Hashrate reduced by 15% temporarily."
        timeLeft="12:08"
      />
    </div>
  );
}
