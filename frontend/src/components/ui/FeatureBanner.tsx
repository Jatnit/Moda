import './FeatureBanner.css';

interface FeatureItem {
  icon: string;
  label: string;
}

const defaultFeatures: FeatureItem[] = [
  { icon: '🚚', label: 'Free ship từ 799K' },
  { icon: '🔄', label: 'Đổi trả 14 ngày' },
  { icon: '💎', label: 'Chất lượng Premium' },
  { icon: '📦', label: 'Hàng mới mỗi tuần' },
];

interface FeatureBannerProps {
  features?: FeatureItem[];
}

export function FeatureBanner({ features = defaultFeatures }: FeatureBannerProps) {
  return (
    <div className="feature-banner">
      {features.map((f, i) => (
        <div key={i} className="feature-banner__item animate-fade-up" style={{ animationDelay: `${i * 100}ms` }}>
          <span className="feature-banner__icon">{f.icon}</span>
          <span className="feature-banner__label">{f.label}</span>
        </div>
      ))}
    </div>
  );
}
