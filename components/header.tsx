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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

type PreviewToken = {
  scheme: string;
  llm_api_key: string;
  llm_model: string;
  llm_base_url: string;
  tavilyserp_api_key: string;
  google_api_key: string;
  google_cse_id: string;
  bing_api_key: string;
};

interface KeyScheme {
  [key: string]:PreviewToken;
}

export default function Header() {
  const router = useRouter();
  const initialPreviewToken = {
    scheme: "",
    llm_api_key: "",
    llm_model: "",
    llm_base_url: "",
    tavilyserp_api_key: "",
    google_api_key: "",
    google_cse_id: "",
    bing_api_key: "",
  };

  const initialKeyScheme: KeyScheme = {
    current: { ...initialPreviewToken },
    keys1: { ...initialPreviewToken },
    keys2: { ...initialPreviewToken },
    keys3: { ...initialPreviewToken },
  };

  const [keyScheme, setKeyScheme] = useLocalStorage<KeyScheme>('ai-token', initialKeyScheme);
  const handleSchemeSelection = (selectedSchemeKey: string) => {
    const selectedScheme = { ...keyScheme, current: { ...keyScheme[selectedSchemeKey], scheme: selectedSchemeKey }};
    setKeyScheme(selectedScheme);
    localStorage.setItem('ai-token', JSON.stringify(selectedScheme));
    setOpen(false); // Assuming you have a state 'open' to control the popover visibility
    window.location.reload();
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
      <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[80px] justify-between"
                >
                  {keyScheme.current.scheme}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[80px] p-0">
                <Command>
                  <CommandGroup>
                    {shcemes.map((shceme) => (
                      <CommandItem
                        key={shceme.value}
                        value={shceme.value}
                        onSelect={(currentValue:string) => {
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
      <Link target='_blank' href={"https://aicube.fun"} className='mx-2 title font-bold'>AICube.fun</Link>
      <SidebarMobile>
        <ChatHistory userId='123456789' />
      </SidebarMobile>

      <div className="flex items-center mx-auto">
        <Tabs defaultValue="account" className="w-[120px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account"><Link href="/">Chat</Link></TabsTrigger>
            <TabsTrigger value="agent"><Link href="/agent">Agents</Link></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center justify-end space-x-2">

      <Button
          variant={'outline'}
          onClick={() => {
            setPreviewTokenDialog(true);
            const schemeText=localStorage.getItem('ai-token');
            if (schemeText) {
              setKeyScheme(JSON.parse(schemeText));
            }
          }}
        >
          Setting
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
          <Tabs defaultValue={keyScheme.current.scheme}>
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
                    value={keyScheme[shceme.value].llm_api_key}
                    placeholder="API KEY of LLM like OpenAI GPT or Gemini"
                    onChange={e => {
                      const newKeyScheme = {...keyScheme};
                      newKeyScheme[shceme.value].llm_api_key = e.target.value;
                      setKeyScheme(newKeyScheme);
                    }}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    LLM Model
                  </Label>
                  <Input className="col-span-2"
                    value={keyScheme[shceme.value].llm_model}
                    placeholder="optional, default is gpt-3.5-turbo-0125"
                    onChange={e => {
                      const newKeyScheme = {...keyScheme};
                      newKeyScheme[shceme.value].llm_model = e.target.value;
                      setKeyScheme(newKeyScheme);
                    }}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    LLM Base URL
                  </Label>
                  <Input className="col-span-2"
                    value={keyScheme[shceme.value].llm_base_url}
                    placeholder="optional, default is https://api.openai.com/v1"
                    onChange={e => {
                      const newKeyScheme = {...keyScheme};
                      newKeyScheme[shceme.value].llm_base_url = e.target.value;
                      setKeyScheme(newKeyScheme);
                    }}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    Bing Search API Key
                  </Label>
                  <Input className="col-span-2"
                    value={keyScheme[shceme.value].bing_api_key}
                    placeholder="from microsoft.com/bing/apis"
                    onChange={e => {
                      const newKeyScheme = {...keyScheme};
                      newKeyScheme[shceme.value].bing_api_key = e.target.value;
                      setKeyScheme(newKeyScheme);
                    }}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    Google Search API Key
                  </Label>
                  <Input className="col-span-2"
                    value={keyScheme[shceme.value].google_api_key}
                    placeholder="optional, from cloud.google.com"
                    onChange={e => {
                      const newKeyScheme = {...keyScheme};
                      newKeyScheme[shceme.value].google_api_key = e.target.value;
                      setKeyScheme(newKeyScheme);
                    }}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    Google custom engine id
                  </Label>
                  <Input className="col-span-2"
                    value={keyScheme[shceme.value].google_cse_id}
                    placeholder="optional, from cloud.google.com"
                    onChange={e => {
                      const newKeyScheme = {...keyScheme};
                      newKeyScheme[shceme.value].google_cse_id = e.target.value;
                      setKeyScheme(newKeyScheme);
                    }}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    Tavily Search API Key
                  </Label>
                  <Input className="col-span-2"
                    value={keyScheme[shceme.value].tavilyserp_api_key}
                    placeholder="optional, from tavily.com"
                    onChange={e => {
                      const newKeyScheme = {...keyScheme};
                      newKeyScheme[shceme.value].tavilyserp_api_key = e.target.value;
                      setKeyScheme(newKeyScheme);
                    }}
                  /></div>
              </div>
              <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setKeyScheme({
                  ...keyScheme,
                  [shceme.value]: {
                    ...keyScheme[shceme.value]
                  },
                });
                setPreviewTokenDialog(false);
                localStorage.setItem('ai-token', JSON.stringify(keyScheme));
                keyScheme.current.scheme = shceme.value;
                window.location.reload();
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

