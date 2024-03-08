'use client'
import { nanoid } from '../lib/utils';
import { useChat, type Message } from 'ai/react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
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
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
}

export function Chat({ id, className }: ChatProps) {
  const timestamp = `${new Date().toISOString().split('.')[0]}`
  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);
  useEffect(() => {
    setInitialMessages([]);
    if (id) {
      const storedData = localStorage.getItem(id);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setInitialMessages(parsedData);
      }
    } else {
      id = `cid_${timestamp}`;
    }
  }, [id]);
  const [apiname, setApiName] = useState('chat')
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiName(event.target.value);
  };
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

  const handleSaveToken = () => {
    setPreviewToken(previewTokenInput);
    setPreviewTokenDialog(false);
  };

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: process.env.NEXT_PUBLIC_API_URL + '/api/' + apiname,
      initialMessages,
      id,
      body: {
        id,
        previewToken
      },
      onResponse(response) {
        if (response.status === 401) {
          toast.error(response.statusText)
        }
      },
      onFinish(response) {
        const msg = initialMessages ?? [];
        const latestAsk = localStorage.getItem('latestAsk')
        if (latestAsk) {
          msg.push({
            id: nanoid(),
            role: 'user',
            content: latestAsk
          })
        }
        msg.push({
          id: response.id,
          role: 'assistant',
          content: response.content
        })
        if (id !== undefined) {
          localStorage.setItem(id, JSON.stringify(msg))
          useRouter().push(`/?cid=${id}`)
          useRouter().refresh()
        }
      }
    })
  useEffect(() => {
    stop();
  }, []);
  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <>
            <EmptyScreen setInput={setInput} />
            <div className="mx-auto max-w-2xl mt-10 text-center">
              <Button
                onClick={() => {
                  setPreviewTokenDialog(true);
                  setPreviewTokenInput(previewToken ?? initialPreviewToken);
                }}
              >
                Key Setting
              </Button></div></>

        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        stop={stop}
        append={append}
        reload={reload}
        messages={messages}
        input={input}
        setInput={setInput}
      />

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
              <Input  className="col-span-2"
                value={previewTokenInput.llm_api_key}
                placeholder="OpenAI sdk format"
                onChange={e => setPreviewTokenInput(prevState => ({
                  ...prevState,
                  llm_api_key: e.target.value
                }))}
              /></div>
            <div className="grid grid-cols-3 items-center gap-3">
              <Label htmlFor="name" className="text-right">
                LLM Model
              </Label>
              <Input  className="col-span-2"
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
              <Input  className="col-span-2"
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
              <Input  className="col-span-2"
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
              <Input  className="col-span-2"
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
              onClick={handleSaveToken}
            >
              Save Token
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className='w-full pb-3 fixed bottom-0 z-50 text-center'>
        <label className='mx-2'>
          <input className='mx-1'
            type="radio"
            value="chat"
            checked={apiname === 'chat'}
            onChange={handleRadioChange}
          />
          Chat
        </label>
        <label className='mx-2'>
          <input className='mx-1'
            type="radio"
            value="search"
            checked={apiname === 'search'}
            onChange={handleRadioChange}
          />
          Search
        </label>
        <label className='mx-2'>
          <input className='mx-1'
            type="radio"
            value="agents"
            checked={apiname === 'agents'}
            onChange={handleRadioChange}
          />
          Agents
        </label>
      </div>
    </>
  )
}
