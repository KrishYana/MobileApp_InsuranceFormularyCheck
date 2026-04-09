import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

type IconFamily = 'material' | 'ionicons';

interface IconConfig {
  family: IconFamily;
  name: string;
}

// Semantic icon mapping -- add entries as needed
export const AppIcons: Record<string, IconConfig> = {
  // Navigation & Actions
  settings: { family: 'ionicons', name: 'settings-sharp' },
  search: { family: 'ionicons', name: 'search' },
  back: { family: 'ionicons', name: 'chevron-back' },
  close: { family: 'ionicons', name: 'close' },
  share: { family: 'ionicons', name: 'share-outline' },

  // Medical & Drug
  pill: { family: 'material', name: 'pill' },
  hospital: { family: 'material', name: 'hospital-building' },
  doctor: { family: 'material', name: 'doctor' },
  flask: { family: 'material', name: 'flask-outline' },
  clipboard: { family: 'material', name: 'clipboard-text-outline' },
  stethoscope: { family: 'material', name: 'stethoscope' },

  // Data & Charts
  chart: { family: 'material', name: 'chart-bar' },
  trending: { family: 'material', name: 'trending-up' },

  // Content
  news: { family: 'material', name: 'newspaper-variant-outline' },
  bookmark: { family: 'material', name: 'bookmark-outline' },
  history: { family: 'material', name: 'history' },

  // Location & Identity
  location: { family: 'material', name: 'map-marker-outline' },
  person: { family: 'ionicons', name: 'person-outline' },

  // Status
  check: { family: 'ionicons', name: 'checkmark-circle' },
  warning: { family: 'ionicons', name: 'warning-outline' },
  info: { family: 'ionicons', name: 'information-circle-outline' },
  lock: { family: 'ionicons', name: 'lock-closed-outline' },

  // Categories
  shield: { family: 'material', name: 'shield-check-outline' },
  timer: { family: 'material', name: 'timer-outline' },
  scale: { family: 'material', name: 'scale-balance' },

  // Misc
  notification: { family: 'ionicons', name: 'notifications-outline' },
  trash: { family: 'ionicons', name: 'trash-outline' },
  link: { family: 'ionicons', name: 'link-outline' },
  mail: { family: 'ionicons', name: 'mail-outline' },
  chevronRight: { family: 'ionicons', name: 'chevron-forward' },
  expand: { family: 'ionicons', name: 'chevron-down' },
  collapse: { family: 'ionicons', name: 'chevron-up' },
  cake: { family: 'material', name: 'cake-variant' },
  gender: { family: 'material', name: 'gender-male-female' },
  document: { family: 'ionicons', name: 'document-text-outline' },
  save: { family: 'material', name: 'content-save-outline' },
};

interface AppIconProps {
  name: keyof typeof AppIcons;
  size?: number;
  color?: string;
}

export function AppIcon({ name, size = 24, color }: AppIconProps) {
  const config = AppIcons[name];
  if (!config) return null;

  if (config.family === 'material') {
    return <MaterialCommunityIcons name={config.name} size={size} color={color} />;
  }
  return <Ionicons name={config.name} size={size} color={color} />;
}
