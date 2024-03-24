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

export default function Header() {
  const router = useRouter();
  const [previewToken, setPreviewToken] = useLocalStorage<{
    llm_api_key: string;
    llm_model: string;
    llm_base_url: string;
    tavilyserp_api_key: string;
    google_api_key: string;
    google_cse_id: string;
    bing_api_key: string;
  } | null>('ai-token', null);

  const initialPreviewToken = {
    llm_api_key: "",
    llm_model: "",
    llm_base_url: "",
    tavilyserp_api_key: "",
    google_api_key: "",
    google_cse_id: "",
    bing_api_key: "",
  };

  const [previewTokenDialog, setPreviewTokenDialog] = useState(false);
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? initialPreviewToken);

  const frameworks = [
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
  const [value, setValue] = React.useState("keys1")
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-12 p-2 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <SidebarToggle />
      <Link target='_blank' href={"https://aicube.fun"} className='title font-bold'>AICube.fun</Link>
      <SidebarMobile>
        <ChatHistory userId='123456789' />
      </SidebarMobile>

      <div className="flex items-center mx-auto">
        <Tabs defaultValue="account" className="w-[200px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="account"><Link href="/">Chat</Link></TabsTrigger>
            <TabsTrigger value="cover"><Link href="/cover">Covers</Link></TabsTrigger>
            <TabsTrigger value="agent"><Link href="/agent">Agents</Link></TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-center justify-end space-x-2">
      {/*<Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[90px] justify-between"
                >
                  {value
                    ? frameworks.find((framework) => framework.value === value)?.label
                    : "Select framework..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[90px] p-0">
                <Command>
                  <CommandGroup>
                    {frameworks.map((framework) => (
                      <CommandItem
                        key={framework.value}
                        value={framework.value}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === framework.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {framework.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
      </Popover> */}
      <Button
          variant={'outline'}
          onClick={() => {
            setPreviewTokenDialog(true);
            setPreviewTokenInput(previewToken ?? initialPreviewToken);
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
          <Tabs defaultValue="keys1">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="keys1">keys1</TabsTrigger>
              <TabsTrigger value="keys2">keys2</TabsTrigger>
              <TabsTrigger value="keys3">keys3</TabsTrigger>
            </TabsList>
            <TabsContent value="keys1">
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
                    Google Search API Key
                  </Label>
                  <Input className="col-span-2"
                    value={previewTokenInput.google_api_key}
                    placeholder="optional, from cloud.google.com"
                    onChange={e => setPreviewTokenInput(prevState => ({
                      ...prevState,
                      google_api_key: e.target.value
                    }))}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    Google custom engine id
                  </Label>
                  <Input className="col-span-2"
                    value={previewTokenInput.google_cse_id}
                    placeholder="optional, from cloud.google.com"
                    onChange={e => setPreviewTokenInput(prevState => ({
                      ...prevState,
                      google_cse_id: e.target.value
                    }))}
                  /></div>
                <div className="grid grid-cols-3 items-center gap-3">
                  <Label htmlFor="name" className="text-right">
                    Tavily Search API Key
                  </Label>
                  <Input className="col-span-2"
                    value={previewTokenInput.tavilyserp_api_key}
                    placeholder="optional, from tavily.com"
                    onChange={e => setPreviewTokenInput(prevState => ({
                      ...prevState,
                      tavilyserp_api_key: e.target.value
                    }))}
                  /></div>
              </div>
            </TabsContent>

          </Tabs>
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

