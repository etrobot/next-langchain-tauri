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
  IconVercel
} from '@/components/ui/icons'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { open } from '@tauri-apps/api/shell';
const openFacebookPage = () => {
  open("https://github.com/etrobot/next-langchain-tauri")
}


export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-12 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center">
      <span className="inline-flex items-center home-links whitespace-nowrap font-bold">▲ Next.js x Langchain.js 🦜🔗</span>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          onClick={openFacebookPage}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="hidden ml-2 md:flex">GitHub</span>
        </Button>
        <ThemeToggle/>
      </div>
    </header>
  )
}
