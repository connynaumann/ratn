import { useContext } from 'react'
import { StoreContext } from './StoreContext'
import type { Store } from './StoreContext'

export function useStore(): Store {
  const wert = useContext(StoreContext)
  if (wert == null) {
    throw new Error('useStore muss innerhalb von <StoreProvider> stehen')
  }
  return wert
}
