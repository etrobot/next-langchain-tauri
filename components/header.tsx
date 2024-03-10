'use client'

import * as React from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
} from '@/components/ui/icons'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { useRouter } from 'next/navigation'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-12 p-2 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
     <SidebarToggle />
     <SidebarMobile>
            <ChatHistory userId='123456789' />
      </SidebarMobile>
      <div className="font-bold hidden md:flex"> ▲ Next.js x Langchain.js 🦜🔗</div>
      <div className="flex items-center mx-auto">
      <Tabs defaultValue="account" className="w-[200px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account"><Link href="/">Chat</Link></TabsTrigger>
        <TabsTrigger value="password"><Link href="/agents">Agents</Link></TabsTrigger>
      </TabsList>
    </Tabs>
      </div>
      
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/etrobot/next-langchain-tauri"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
          >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </a>
        <ThemeToggle/>
      </div>
    </header>
  )
}
