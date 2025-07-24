import React from 'react';

export default function RBCEventWrapper({ style, className, children }) {
  return (
    <div style={style} className={className}>{children}</div>
  );
} 