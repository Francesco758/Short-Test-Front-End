/**
 * Light Theme Configuration
 * 
 * This file contains all the light theme styling patterns used across the application.
 * Import and use these constants to ensure consistent light theme styling across components.
 * 
 * Usage example:
 * import { lightTheme } from './lightThemeConfig';
 * 
 * <div className={lightTheme.backgrounds.main}>
 *   <button className={lightTheme.buttons.primary}>Click</button>
 * </div>
 */

export const lightTheme = {
  // Background colors
  backgrounds: {
    main: 'bg-white',
    card: 'bg-[#17be8e]',
    modal: 'bg-white',
    modalOverlay: 'bg-black/40',
    input: 'bg-white',
    select: 'bg-white',
    textarea: 'bg-white',
    hover: 'hover:bg-gray-50',
    hoverActive: 'hover:bg-gray-200',
    disabled: 'bg-gray-200',
    contentArea: 'bg-white',
    footer: 'bg-gray-50',
  },

  // Border colors
  borders: {
    main: 'border-gray-200',
    card: 'border-emerald-700',
    cardShadow: 'shadow-[0_0_0_1px_#047857]',
    input: 'border-gray-300',
    button: 'border-gray-300',
    modal: 'border-emerald-700',
    divider: 'border-gray-200',
  },

  // Text colors
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    tertiary: 'text-gray-500',
    muted: 'text-gray-400',
    inverse: 'text-white',
    error: 'text-red-600',
    success: 'text-emerald-600',
  },

  // Button styles
  buttons: {
    primary: 'bg-[#17be8e] text-white border-emerald-700 hover:bg-[#15a87d]',
    secondary: 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50',
    tertiary: 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
    close: 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200',
    transparent: 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100',
    disabled: 'bg-gray-200 text-gray-400 cursor-not-allowed',
  },

  // Input styles
  inputs: {
    default: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    focus: 'focus:ring-2 focus:ring-emerald-500',
  },

  // Card styles
  cards: {
    default: 'bg-[#17be8e] border-emerald-700',
    hover: 'hover:bg-gray-50',
    selected: 'bg-emerald-50 border-l-4 border-l-emerald-500',
  },

  // Modal styles
  modals: {
    container: 'border-emerald-700 bg-white shadow-[0_0_0_1px_#047857]',
    header: 'border-gray-200',
    footer: 'border-gray-200 bg-gray-50',
  },

  // Table styles
  table: {
    header: 'bg-gray-50 border-b border-gray-200',
    headerText: 'text-gray-600',
    body: 'bg-white divide-y divide-gray-200',
    row: 'hover:bg-gray-50',
    rowSelected: 'bg-emerald-50 border-l-4 border-l-emerald-500',
    footer: 'border-gray-200 bg-gray-50',
  },

  // Badge/Tag styles
  badges: {
    superAdmin: 'bg-red-100 text-red-700 border-red-200',
    companyAdmin: 'bg-purple-100 text-purple-700 border-purple-200',
    user: 'bg-gray-100 text-gray-600 border-gray-200',
    function: 'text-gray-600 border-gray-200',
    seniority: 'text-gray-600 border-gray-200',
  },

  // Error states
  error: {
    border: 'border-red-200',
    background: 'bg-red-50',
    text: 'text-red-600',
  },

  // Shadow styles
  shadows: {
    card: 'shadow-xl',
    button: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
  },

  // Transition styles
  transitions: {
    default: 'transition-colors duration-200',
    fast: 'transition-colors duration-150',
  },
};

/**
 * Helper function to get conditional classes based on theme
 * 
 * @param {boolean} isLightTheme - Whether light theme is active
 * @param {object} styles - Object with light and dark theme classes
 * @returns {string} - Appropriate class string
 * 
 * Usage:
 * const className = getThemeClass(isLightTheme, {
 *   light: 'bg-white text-gray-900',
 *   dark: 'bg-[#09090B] text-white'
 * });
 */
export const getThemeClass = (isLightTheme, styles) => {
  return isLightTheme ? styles.light : styles.dark;
};

/**
 * Helper function to merge light theme classes with existing classes
 * 
 * @param {string} baseClasses - Base classes to apply
 * @param {object} lightThemeClasses - Light theme specific classes to merge
 * @param {boolean} isLightTheme - Whether light theme is active
 * @returns {string} - Merged class string
 * 
 * Usage:
 * const className = mergeLightThemeClasses(
 *   'px-4 py-2 rounded-md',
 *   lightTheme.inputs.default,
 *   isLightTheme
 * );
 */
export const mergeLightThemeClasses = (baseClasses, lightThemeClasses, isLightTheme) => {
  if (!isLightTheme) return baseClasses;
  return `${baseClasses} ${lightThemeClasses}`;
};
