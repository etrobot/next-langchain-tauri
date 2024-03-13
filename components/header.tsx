'use client'

import * as React from 'react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
} from '@/components/ui/icons'
import { SidebarMobile } from './sidebar-mobile'
import { SidebarToggle } from './sidebar-toggle'
import { ChatHistory } from './chat-history'
import { useRouter } from 'next/navigation'
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from "@/components/ui/tabs"
import Link from 'next/link'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from "@/components/ui/label"
import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'

export default function Header() {
  const router = useRouter();
  const [previewToken, setPreviewToken] = useLocalStorage<{
    llm_api_key: string;
    llm_model: string;
    llm_base_url: string;
    search_api_key: string;
    bing_api_key: string;
  } | null>('ai-token', null);

  const initialPreviewToken = {
    llm_api_key: "",
    llm_model: "",
    llm_base_url: "",
    search_api_key: "",
    bing_api_key: ""
  };

  const [previewTokenDialog, setPreviewTokenDialog] = useState(false);
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? initialPreviewToken);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-12 p-2 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <SidebarToggle />
      <SidebarMobile>
        <ChatHistory userId='123456789' />
      </SidebarMobile>
      <div className="hidden md:flex"> ▲ Next.js × Langchain.js 🦜🔗</div>
      <div className="flex items-center mx-auto">
        <Link target='_blank' href={"https://aicube.fun"} className='title font-bold'>AICube.fun</Link>
        {/* <Tabs defaultValue="account" className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account"><Link href="/">Chat</Link></TabsTrigger>
            <TabsTrigger value="password"><Link href="/agents">Agents</Link></TabsTrigger>
          </TabsList>
        </Tabs>*/}
      </div> 

      <div className="flex items-center justify-end space-x-2">
      <Button
                onClick={() => {
                  setPreviewTokenDialog(true);
                  setPreviewTokenInput(previewToken ?? initialPreviewToken);
                }}
              >
                Key Setting
              </Button>
        <a
          target="_blank"
          href="https://github.com/etrobot/next-langchain-tauri"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
        </a>
        <ThemeToggle />
      </div>
      <Dialog open={previewTokenDialog} onOpenChange={setPreviewTokenDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>🔑 Enter your API Keys</DialogTitle>
            <DialogDescription>
              Keys are stored in your computer without sharing to anyone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="name" className="text-right">
                * LLM API Key
              </Label>
              <Input className="col-span-2"
                value={previewTokenInput.llm_api_key}
                placeholder="API KEY of LLM like OpenAI GPT or Gemini"
                onChange={e => setPreviewTokenInput(prevState => ({
                  ...prevState,
                  llm_api_key: e.target.value
                }))}
              /></div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="name" className="text-right">
                LLM Model
              </Label>
              <Input className="col-span-2"
                value={previewTokenInput.llm_model}
                placeholder="optional, default is gpt-3.5-turbo-0125"
                onChange={e => setPreviewTokenInput(prevState => ({
                  ...prevState,
                  llm_model: e.target.value
                }))}
              /></div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="name" className="text-right">
                LLM Base URL
              </Label>
              <Input className="col-span-2"
                value={previewTokenInput.llm_base_url}
                placeholder="optional, default is https://api.openai.com/v1"
                onChange={e => setPreviewTokenInput(prevState => ({
                  ...prevState,
                  llm_base_url: e.target.value
                }))}
              /></div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="name" className="text-right">
                Bing Search API Key
              </Label>
              <Input className="col-span-2"
                value={previewTokenInput.bing_api_key}
                placeholder="from microsoft.com/bing/apis"
                onChange={e => setPreviewTokenInput(prevState => ({
                  ...prevState,
                  bing_api_key: e.target.value
                }))}
              /></div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="name" className="text-right">
                Tavily Search API Key
              </Label>
              <Input className="col-span-2"
                value={previewTokenInput.search_api_key}
                placeholder="optional, from tavily.com"
                onChange={e => setPreviewTokenInput(prevState => ({
                  ...prevState,
                  search_api_key: e.target.value
                }))}
              /></div>
          </div>
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setPreviewToken(previewTokenInput);
                setPreviewTokenDialog(false);
                // router.replace('/');
                // router.refresh();
                window.location.reload();
              }}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
