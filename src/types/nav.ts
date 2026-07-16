import type { ReactElement, ReactNode } from 'react';
import { Href } from 'expo-router';

export type CardIconProps = {
    color?: string;
    size?: number;
    strokeWidth?: number;
};



export type NavItemProps = {
    icon: ReactElement<CardIconProps>;
    label: string,
    active?: boolean;
    dest: Href;
};