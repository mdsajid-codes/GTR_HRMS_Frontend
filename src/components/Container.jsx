import React from 'react';

const Container = ({ children, className = "" }) => (
  <div className={`mx-auto max-w-7xl px-6 ${className}`}>{children}</div>
);

export default Container;