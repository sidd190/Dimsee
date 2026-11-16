import React, { useState } from 'react';

let globalIdCounter = 0;

/**
 * Custom hook to generate a unique, stable ID for a component instance.
 * Accounts for React >= 16.8 compatibility by using React.useId when available (React 18+),
 * and falling back to a stable state-based counter in React 16.8 and 17.
 *
 * @param {string} [customId] - Optional explicit ID override.
 * @returns {string} Unique stable ID string.
 */
const useId = (customId) => {
  const reactUseId = React['useId'];

  if (typeof reactUseId === 'function') {
    const id = reactUseId();
    return customId || id;
  }

  const [fallbackId] = useState(() => {
    globalIdCounter += 1;
    return `:dimsee-r${globalIdCounter}:`;
  });

  return customId || fallbackId;
};

export default useId;
