'use client'

import { useRef, ReactNode } from 'react'
import { Provider } from 'react-redux'
import { AppStore, makeStore } from '../lib/store/store'

interface StoreProviderProps {
  children: ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const storeRef = useRef<AppStore | undefined>(undefined)

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  return <Provider store={storeRef.current}>{children}</Provider>
}
