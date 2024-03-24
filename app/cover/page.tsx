'use client'
import Covers from '@/components/covers'
import { useState } from 'react'

export default function CoversPage() {
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  return <Covers showPinnedOnly={showPinnedOnly}/>
}
