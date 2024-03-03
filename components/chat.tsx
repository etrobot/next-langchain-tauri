'use client'

import { useChat, type Message } from 'ai/react'
import { nanoid } from 'nanoid'
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
import { useState,useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'

export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
}

export function Chat({ id, className }: ChatProps) {

  const [initialMessages, setInitialMessages] = useState<Message[] | undefined>(undefined);

  useEffect(() => {
    if (id) {
      const storedData = localStorage.getItem(id);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setInitialMessages(parsedData);
      }else{
        setInitialMessages([]);
      }
    }else{
      id=`chatid_${nanoid()}`;
    }
  }, [id]);

  const [previewToken, setPreviewToken] = useLocalStorage<{
    llm_api_key: string;
    llm_base_url: string;
    serp_api_key: string;
  } | null>('ai-token', null);
  
  const initialPreviewToken = {
    llm_api_key: "",
    llm_base_url: "",
    serp_api_key: ""
  };
  
  const [previewTokenDialog, setPreviewTokenDialog] = useState(false);
  const [previewTokenInput, setPreviewTokenInput] = useState(previewToken ?? initialPreviewToken);
    
  const handleSaveToken = () => {
    setPreviewToken(previewTokenInput);
    setPreviewTokenDialog(false);
  };
  
  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api:'http://localhost:6677/api/chat',
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
        const msg = initialMessages??[];
        msg.push({
          id: response.id,
          role: 'assistant',
          content: response.content
        })
        if(id!==undefined)localStorage.setItem(id, JSON.stringify(msg))
      }
    })
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your API Keys</DialogTitle>
        </DialogHeader>
        <Input
          value={previewTokenInput.llm_api_key}
          placeholder="LLM API Key, like sk-xxxxx"
          onChange={e => setPreviewTokenInput(prevState => ({
            ...prevState,
            llm_api_key: e.target.value
          }))}
        />
        <Input
          value={previewTokenInput.llm_base_url}
          placeholder="Base URL, default is https://api.openai.com/v1"
          onChange={e => setPreviewTokenInput(prevState => ({
            ...prevState,
            llm_base_url: e.target.value
          }))}
        />
        <Input
          value={previewTokenInput.serp_api_key}
          placeholder="SERP API Key , from https://serpapi.com"
          onChange={e => setPreviewTokenInput(prevState => ({
            ...prevState,
            serp_api_key: e.target.value
          }))}
        />
        <DialogFooter className="items-center">
          <Button
            onClick={handleSaveToken}
          >
            Save Token
          </Button>
        </DialogFooter>
      </DialogContent>
      </Dialog>

    </>
  )
}
