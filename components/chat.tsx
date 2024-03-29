'use client'
import { nanoid } from '../lib/utils';
import { useChat, type Message } from 'ai/react'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Agents from '@/components/agents'
export interface ChatProps extends React.ComponentProps<'div'> {
  id?: string
}

export function Chat({ id, className }: ChatProps) {
  const router = useRouter();
  const [showPinnedOnly, setShowPinnedOnly] = useState(true);
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
  

  const initialPreviewToken = {
    llm_api_key: "",
    llm_model: "",
    llm_base_url: "",
    tavilyserp_api_key: "",
    google_api_key: "",
    google_cse_id: "",
    bing_api_key: "",
  };
  const [previewToken, setPreviewToken] = useState(initialPreviewToken)
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
        }
      },
      onFinish(response) {
        const msg =  messages ?? initialMessages;
        msg.push({
          id: nanoid(),
          role: 'assistant',
          content: response.content
        })
        localStorage.setItem(id||`cid_${timestamp}`, JSON.stringify(msg));
        router.replace(`/?cid=${id}`);
        router.refresh();
      }
    })

  useEffect(() => {
    stop();
    const token = localStorage.getItem('ai-token')
    if (token) {
      setPreviewToken(JSON.parse(token).current)
    }
    else { toast.error('Please set the API keys'); }
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
            <Agents setInput={setInput} showPinnedOnly={showPinnedOnly}/>
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
      />

    </>
  )
}
