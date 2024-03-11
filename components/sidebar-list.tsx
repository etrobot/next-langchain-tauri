'use client'
import { ClearHistory } from '@/components/clear-history'
import { SidebarItems } from '@/components/sidebar-items'
import { ThemeToggle } from '@/components/theme-toggle'
import { type Message } from 'ai'
import { Chat } from '@/lib/types'

interface SidebarListProps {
  userId?: string
  children?: React.ReactNode
}


export function SidebarList({ userId }: SidebarListProps) {

  const chatKeys: string[] = Object.keys(localStorage).filter(key => key.startsWith('cid_'));
  chatKeys.sort().reverse();

  const chats:Chat[] = chatKeys.map(key => {
    const messages = JSON.parse(localStorage.getItem(key) || "");
    return {
      id: key,
      messages
    };
  });

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
