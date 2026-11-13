import React from 'react';
import { motion } from 'framer-motion';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  onClick, 
  className = '',
  type = 'button'
}) {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-full)',
    fontWeight: '500',
    transition: 'all var(--duration-normal) var(--ease-smooth)',
    cursor: 'pointer',
    width: fullWidth ? '100%' : 'auto',
    border: 'none',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--text-primary)',
      color: 'var(--crema)',
      boxShadow: 'var(--shadow-md)',
    },
    secondary: {
      backgroundColor: 'var(--rosa-suave)',
      color: 'var(--text-primary)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--text-primary)',
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
      style={{ ...baseStyles, ...variants[variant], ...sizes[size] }}
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
