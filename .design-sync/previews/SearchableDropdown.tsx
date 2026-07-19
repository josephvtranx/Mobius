import React from 'react';
import { SearchableDropdown } from 'mobius-client';

const subjects = [
  { id: 1, name: 'Algebra' }, { id: 2, name: 'Geometry' },
  { id: 3, name: 'SAT Math' }, { id: 4, name: 'Physics' }, { id: 5, name: 'Chemistry' }
];
const box = (children: React.ReactNode) => <div style={{ width: 280 }}>{children}</div>;

export const Default = () => box(
  <SearchableDropdown options={subjects} placeholder="Select a subject" onChange={() => {}} />
);
export const WithValue = () => box(
  <SearchableDropdown options={subjects} value={3} placeholder="Select a subject" onChange={() => {}} />
);
export const Loading = () => box(
  <SearchableDropdown options={[]} isLoading placeholder="Loading subjects…" onChange={() => {}} />
);
export const ErrorState = () => box(
  <SearchableDropdown options={subjects} error="Could not load subjects" placeholder="Select a subject" onChange={() => {}} />
);
export const Disabled = () => box(
  <SearchableDropdown options={subjects} disabled placeholder="Select a subject" onChange={() => {}} />
);
