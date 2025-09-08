import React from 'react';

const Button = ({ children, variant = "solid", className = "", ...props }) => {
  // Base styles are now in index.css via @layer components.
  // This makes it easier to maintain a consistent design system.
  // We only add responsive width adjustments here.
  const base = "w-full sm:w-auto";
  const styles =
    variant === "solid"
      ? "btn-primary"
      : variant === "outline"
      ? "btn-secondary"
      : variant === "ghost"
      ? "btn-ghost"
      : "btn-primary"; // Default to solid/primary
  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;