'use client'
import { nanoid } from '../lib/utils';
import { useChat, type Message } from 'ai/react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
// import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'react-hot-toast'
import { redirect, useRouter } from 'next/navigation'
import Agents from '@/components/agents'
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
  const [previewToken, setPreviewToken] = useLocalStorage<{
    llm_api_key: string;
    llm_model: string;
    llm_base_url: string;
    search_api_key: string;
    bing_api_key: string;
    usetool?: boolean
  } | null>('ai-token', null);

  const { messages, append, reload, stop, isLoading, input, setInput } =
    useChat({
      api: process.env.NEXT_PUBLIC_API_URL + '/api/chat',
      initialMessages,
      id,
      body: {
        id,
        previewToken,
        locale: navigator.language,
      },
      onResponse(response) {
        if (response.status !== 200) {
          toast.error(`${response.status} ${response.statusText}`)
          localStorage.removeItem('agentPrompt');
          localStorage.removeItem('usetool');
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
          localStorage.setItem(id, JSON.stringify(msg));
          useRouter().replace(`/?cid=${id}`);
        }
      }
    })

  useEffect(() => {
    stop();
    const token=localStorage.getItem('ai-token')
    if(token){
      setPreviewToken(JSON.parse(token))
    }
    else{toast.error('Please set the API keys');}
  }, []);
  return (
    <>
      <div className={cn('pb-[200px] md:pt-2', className)}>
        {messages.length ? (
          <>
            <ChatList messages={messages} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </>
        ) : (
          <>
            <Agents setInput={setInput} />
          </>
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
        setPreviewToken={setPreviewToken}
      />

    </>
  )
}
