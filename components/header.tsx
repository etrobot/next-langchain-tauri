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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Link from 'next/link'
import { useSetting } from '@/lib/hooks/use-setting'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { ChevronsUpDown } from "lucide-react"
import {initialKeyScheme } from '@/lib/hooks/use-setting'


export default function Header() {
  const router = useRouter();
  const [keys, setKeys]  = useSetting();
  const [keyInput, setKeyInput] = useState(initialKeyScheme);
  const handleSchemeSelection = (selectedSchemeKey: string) => {
    if (typeof keys === 'object' && 'current' in keys) {
      const selectedScheme = { ...keys, current: { ...keys[selectedSchemeKey], scheme: selectedSchemeKey } };
      setKeys(selectedScheme);
      setOpen(false); // Assuming you have a state 'open' to control the popover visibility
      router.refresh();
    }
  };

  const [previewTokenDialog, setPreviewTokenDialog] = useState(false);

  const shcemes = [
    {
      value: "keys1",
      label: "keys1",
    },
    {
      value: "keys2",
      label: "keys2",
    },
    {
      value: "keys3",
      label: "keys3",
    }
  ]
  const [open, setOpen] = React.useState(false)
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-12 p-2 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <SidebarToggle />
      <SidebarMobile>
        <ChatHistory userId='123456789' />
      </SidebarMobile>
      <div className='hidden md:block sm:hidden'>
        <a
          target="_blank"
          href="https://github.com/etrobot/next-langchain-tauri"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
        </a>
        <Link target='_blank' href={"https://aicube.fun"} className='mx-2 title font-bold'>AICube.fun</Link>
      </div>

      <div className="flex items-center mx-auto">
        <Tabs defaultValue="account" className="w-[120px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account"><Link href="/">Chat</Link></TabsTrigger>
            <TabsTrigger value="agent"><Link href="/agent">Agents</Link></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[80px] justify-between"
            >
              {keys.current.scheme || 'None'}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[80px] p-0">
            <Command>
              <CommandGroup>
                {shcemes.map((shceme) => (
                  <CommandItem
                    key={shceme.value}
                    value={shceme.value}
                    onSelect={(currentValue: string) => {
                      handleSchemeSelection(currentValue)
                      setOpen(false)
                    }}
                  >
                    {shceme.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        <Button
          variant={'outline'}
          onClick={() => {
            const item = window.localStorage.getItem('ai-token')
            if (item) {
              setKeys(JSON.parse(item))
            }
            setKeyInput(keys)
            setPreviewTokenDialog(true);
          }}
        >
          🔑
        </Button>
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
          <Tabs defaultValue={keys.current.scheme}>
            <TabsList className="grid w-full grid-cols-3">
              {shcemes.map((shceme) => (
                <TabsTrigger value={shceme.value}>{shceme.label}</TabsTrigger>
              ))}
            </TabsList>
            {shcemes.map((shceme) => (
              <TabsContent value={shceme.value}>
                <div className="grid gap-3 py-4">
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name" className="text-right">
                      * LLM API Key
                    </Label>
                    <Input className="col-span-2"
                      value={keyInput[shceme.value].llm_api_key}
                      placeholder="API KEY of LLM like OpenAI GPT or Gemini"
                      onChange={e => {
                        const newkeys = { ...keyInput };
                        newkeys[shceme.value].llm_api_key = e.target.value;
                        setKeyInput(newkeys);
                      }}
                    /></div>
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name" className="text-right">
                      LLM Model
                    </Label>
                    <Input className="col-span-2"
                      value={keyInput[shceme.value].llm_model}
                      placeholder="optional, default is gpt-3.5-turbo-0125"
                      onChange={e => {
                        const newkeys = { ...keyInput };
                        newkeys[shceme.value].llm_model = e.target.value;
                        setKeyInput(newkeys);
                      }}
                    /></div>
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name" className="text-right">
                      LLM Base URL
                    </Label>
                    <Input className="col-span-2"
                      value={keyInput[shceme.value].llm_base_url}
                      placeholder="optional, default is https://api.openai.com/v1"
                      onChange={e => {
                        const newkeys = { ...keyInput };
                        newkeys[shceme.value].llm_base_url = e.target.value;
                        setKeyInput(newkeys);
                      }}
                    /></div>
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name" className="text-right">
                      Bing Search API Key
                    </Label>
                    <Input className="col-span-2"
                      value={keyInput[shceme.value].bing_api_key}
                      placeholder="from microsoft.com/bing/apis"
                      onChange={e => {
                        const newkeys = { ...keyInput };
                        newkeys[shceme.value].bing_api_key = e.target.value;
                        setKeyInput(newkeys);
                      }}
                    /></div>
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name" className="text-right">
                      Google Search API Key
                    </Label>
                    <Input className="col-span-2"
                      value={keyInput[shceme.value].google_api_key}
                      placeholder="optional, from cloud.google.com"
                      onChange={e => {
                        const newkeys = { ...keyInput };
                        newkeys[shceme.value].google_api_key = e.target.value;
                        setKeyInput(newkeys);
                      }}
                    /></div>
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name" className="text-right">
                      Google custom engine id
                    </Label>
                    <Input className="col-span-2"
                      value={keyInput[shceme.value].google_cse_id}
                      placeholder="optional, from cloud.google.com"
                      onChange={e => {
                        const newkeys = { ...keyInput };
                        newkeys[shceme.value].google_cse_id = e.target.value;
                        setKeyInput(newkeys);
                      }}
                    /></div>
                  <div className="grid grid-cols-3 items-center gap-3">
                    <Label htmlFor="name" className="text-right">
                      Tavily Search API Key
                    </Label>
                    <Input className="col-span-2"
                      value={keyInput[shceme.value].tavilyserp_api_key}
                      placeholder="optional, from tavily.com"
                      onChange={e => {
                        const newkeys = { ...keyInput };
                        newkeys[shceme.value].tavilyserp_api_key = e.target.value;
                        setKeyInput(newkeys);
                      }}
                    /></div>
                </div>
                <DialogFooter className="items-center">
                  <Button
                    onClick={() => {
                      keyInput.scheme = keyInput[keys.current.scheme || 'keys1']
                      setKeys(keyInput);
                      handleSchemeSelection(keys.current.scheme);
                      localStorage.setItem('ai-token', JSON.stringify(keyInput));
                      router.refresh();
                      setPreviewTokenDialog(false);
                    }}
                  >
                    Save Token
                  </Button>
                </DialogFooter>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </header>
  )
}

