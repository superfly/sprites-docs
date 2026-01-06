import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { SearchDialog, type SearchDialogHandle } from './SearchDialog';

export const SearchDialogWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<SearchDialogHandle>(null);

  useEffect(() => {
    const handleOpen = () => {
      // CRITICAL: Focus the hidden proxy input SYNCHRONOUSLY before state change
      // This is required for iOS Safari to show the keyboard
      // The proxy input is always in the DOM, so this works even before the dialog renders
      dialogRef.current?.focusInput();
      setIsOpen(true);
    };

    // Listen for custom event from Astro component
    document.addEventListener('open-search', handleOpen);

    return () => {
      document.removeEventListener('open-search', handleOpen);
    };
  }, []);

  return (
    <SearchDialog
      ref={dialogRef}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  );
};

export default SearchDialogWrapper;
