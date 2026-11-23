import React, { ReactNode } from 'react';

import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import type { FeatureFlagKey } from '../../services/featureFlags';

interface FeatureProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export const FeatureFlag: React.FC<FeatureProps> = ({ flag, children, fallback = null }) => {
  const isEnabled = useFeatureFlag(flag);

  if (isEnabled) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
