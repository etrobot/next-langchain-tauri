'use client'
import { Chat } from '@/components/chat'
import { useSearchParams } from 'next/navigation'
export default function IndexPage() {
  const params = useSearchParams()
  const timestamp = `${new Date(2024, 0, 1, 11, 23).toISOString().replace(/[-:]/g, '').replace('T', '')}`
  return <Chat id={params!.get('cid') || `cid_${timestamp}`}/>
}
