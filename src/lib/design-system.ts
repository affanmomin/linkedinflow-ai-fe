/**
 * LinkedInFlow Design System
 * Centralized color and styling constants for consistent UI
 *
 * MANDATORY RULES FOR REGRESSION PREVENTION:
 * 1. Never use hardcoded hex colors - always use designSystem colors
 * 2. All borders must use designSystem.borders or designSystem.colors.border
 * 3. All shadows must use designSystem.shadows or predefined CSS vars
 * 4. All spacing must use designSystem.spacing scale (8px base unit)
 * 5. Typography must use Orbitron (display) or Plus Jakarta Sans (body) only
 * 6. Status colors must match semantic meanings (success/warning/info/danger)
 * 7. Card styling must use designSystem.cardStyles as base classes
 * 8. Button styling must use designSystem.buttonStyles hierarchy
 * 9. Form elements must use consistent input/select/textarea styling
 * 10. No custom color/spacing definitions outside designSystem - extend here
 */

export const designSystem = {
  colors: {
    // Primary brand color
    primary: '#0a66c2',
    primaryLight: '#eef3f8',

    // Surfaces
    white: '#ffffff',
    background: '#f8f9fb',
    surface: '#ffffff',

    // Text colors
    foreground: '#191919',
    textSecondary: '#595959',
    textMuted: '#86888a',

    // Borders
    border: '#dce6f1',
    borderLight: '#e0dfdc',

    // Status colors (semantic)
    success: '#22c55e', // green (published)
    warning: '#f59e0b', // amber (draft)
    info: '#0a66c2',    // blue (scheduled)
    danger: '#ef4444',  // red (failed)
  },

  borders: {
    default: '1px solid #dce6f1',
    light: '1px solid #e0dfdc',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px rgba(0,0,0,0.07)',
    lg: '0 10px 15px rgba(0,0,0,0.1)',
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  },

  // Status styling for badges/indicators
  statuses: {
    published: {
      color: '#22c55e',
      bg: '#dcfce7',
      text: 'text-green-700',
    },
    draft: {
      color: '#f59e0b',
      bg: '#fef3c7',
      text: 'text-amber-700',
    },
    scheduled: {
      color: '#0a66c2',
      bg: '#dbeafe',
      text: 'text-blue-700',
    },
    failed: {
      color: '#ef4444',
      bg: '#fee2e2',
      text: 'text-red-700',
    },
  },

  // Card styling classes
  cardStyles: {
    base: 'rounded-lg border border-[#dce6f1] bg-white shadow-sm hover:shadow-md transition-shadow duration-200',
    header: 'border-b border-[#dce6f1] pb-4',
  },

  // Button styling
  buttonStyles: {
    primary: 'bg-[#0a66c2] text-white hover:bg-[#004182] border-0 font-semibold',
    secondary: 'border-2 border-[#0a66c2] text-[#0a66c2] bg-transparent hover:bg-[#0a66c2]/10',
    outline: 'border-[#dce6f1] hover:bg-[#eef3f8]',
  },
};

// Helper functions for status styling
export const getStatusColor = (status: 'published' | 'draft' | 'scheduled' | 'failed') => {
  return designSystem.statuses[status];
};

export const getStatusBgColor = (status: 'published' | 'draft' | 'scheduled' | 'failed') => {
  const bg: Record<string, string> = {
    published: 'bg-green-500',
    draft: 'bg-amber-500',
    scheduled: 'bg-[#0a66c2]',
    failed: 'bg-red-500',
  };
  return bg[status];
};

// Typography utilities - enforce design system fonts
export const typography = {
  display: 'font-orbitron',
  body: 'font-plus-jakarta',
};

// Utility to validate color usage (development only)
export const validateColorCompliance = (color: string): boolean => {
  // In production, this helps developers catch hardcoded colors in testing
  const designSystemColors = Object.values(designSystem.colors);
  const isCSSVar = color.includes('var(');
  const isDesignSystemColor = designSystemColors.includes(color);
  const isCommonUtility = ['inherit', 'transparent', 'currentColor'].includes(color);

  return isCSSVar || isDesignSystemColor || isCommonUtility;
};

// Spacing utility - ensures 8px base unit consistency
export const getSpacing = (multiplier: number): string => {
  const basePx = 8;
  return `${basePx * multiplier}px`;
};

// Common responsive breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};
