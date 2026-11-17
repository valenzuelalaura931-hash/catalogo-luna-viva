import React from 'react';
import { motion } from 'framer-motion';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  onClick, 
  className = '',
  type = 'button',
  style = {},
  disabled = false
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    transition: 'all var(--duration-normal) var(--ease-smooth)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: '#8A5B66',
      color: '#FFFFFF',
      boxShadow: '0 4px 14px rgba(138, 91, 102, 0.25)',
    },
    secondary: {
      backgroundColor: 'var(--rosa-suave)',
      color: '#8A5B66',
    },
    outline: {
      backgroundColor: '#FFFFFF',
      color: '#8A5B66',
      border: '1.5px solid #8A5B66',
    },
    accent: {
      backgroundColor: 'var(--accent)',
      color: 'white',
      boxShadow: 'var(--shadow-md)',
    }
  };

  const sizes = {
    sm: { padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)' },
    md: { padding: 'var(--space-3) var(--space-6)', fontSize: 'var(--text-base)' },
    lg: { padding: 'var(--space-4) var(--space-8)', fontSize: 'var(--text-lg)' }
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      style={{ ...baseStyles, ...variants[variant], ...sizes[size], ...style }}
      className={className}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
