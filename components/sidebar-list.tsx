'use client'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { cache } from 'react'
import { Chat } from '@/lib/types'
interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}


export function SidebarList({ userId }: SidebarListProps) {

  const chats: string[] =  Object.keys(localStorage).filter(key => key.startsWith('cid_'))
  chats.sort().reverse();
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        {chats?.length ? (
          <div className="space-y-2 px-2">
            <SidebarItems chats={chats} />
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No chat history</p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between p-4">
        <ThemeToggle />
        <ClearHistory isEnabled={chats?.length > 0} />
      </div>
    </div>
  )
}
