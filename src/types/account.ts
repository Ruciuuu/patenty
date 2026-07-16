import type { ReactElement, ReactNode } from 'react';

export type CardIconProps = {
  color?: string;
  size?: number;
  strokeWidth?: number;
};

export type AccountDataCardProps = {
  icon: ReactElement<CardIconProps>;
  title: string;
  value: ReactNode;
  isLoading?: boolean;
  accent?: 'blue' | 'green';
};