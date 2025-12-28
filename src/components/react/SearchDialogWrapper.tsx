import React, { useState, useEffect } from 'react'
import { SearchDialog } from './SearchDialog'

export const SearchDialogWrapper: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)

    // Listen for custom event from Astro component
    document.addEventListener('open-search', handleOpen)

    return () => {
      document.removeEventListener('open-search', handleOpen)
    }
  }, [])

  return <SearchDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
}

export default SearchDialogWrapper
