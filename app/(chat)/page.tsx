'use client'
import { Chat } from '@/components/chat'
import { useSearchParams } from 'next/navigation'
export default function IndexPage() {
  const params = useSearchParams()
  const timestamp = `${new Date().toISOString().split('.')[0]}`
  return <Chat id={params!.get('cid') || `cid_${timestamp}`}/>
}
