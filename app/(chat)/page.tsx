'use client'
import { nanoid } from '@/lib/utils'
import { Chat } from '@/components/chat'
import { useSearchParams } from 'next/navigation'
export default function IndexPage() {
  const params = useSearchParams()
  return <Chat id={params!.get('cid') || `chatid_${nanoid()}`}/>
}
