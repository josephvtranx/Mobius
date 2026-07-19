import React from 'react';
import { SummaryCard } from 'mobius-client';

const up = [4, 6, 5, 8, 9, 11, 14].map((value) => ({ value }));
const down = [14, 12, 13, 9, 8, 6, 5].map((value) => ({ value }));

export const Revenue = () => (
  <div style={{ width: 300 }}>
    <SummaryCard title="Monthly revenue" value={42800} year={2026} percentChange={12.4} isPositive chartData={up} lineColor="#2e9d8d" />
  </div>
);

export const EnrollmentDip = () => (
  <div style={{ width: 300 }}>
    <SummaryCard title="Active enrollments" value={186} year={2026} percentChange={-3.1} isPositive={false} chartData={down} lineColor="#c0654f" />
  </div>
);
