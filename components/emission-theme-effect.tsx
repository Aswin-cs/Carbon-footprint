"use client";

import { useEffect } from 'react';
import { useEco } from '@/components/eco-provider';

export default function EmissionThemeEffect() {
  const { weeklyEmissions } = useEco();

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todayEmissions = weeklyEmissions.find(e => e.name === today)?.emissions || 0;

  useEffect(() => {
    // If todayEmissions <= 70, factor is 0 (normal white theme)
    // If todayEmissions >= 120, factor is 1 (full dark mode)
    const factor = Math.min(Math.max((todayEmissions - 70) / 50, 0), 1);

    const r = Math.round(248 - (248 - 15) * factor);
    const g = Math.round(250 - (250 - 23) * factor);
    const b = Math.round(252 - (252 - 36) * factor);

    const body = document.getElementById('page-wrapper');
    if (body) {
      body.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      
      // Update text colors based on the dark background
      if (factor > 0.5) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [todayEmissions]);

  return null;
}
