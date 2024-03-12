import * as React from 'react'
import { type UseChatHelpers } from 'ai/react'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { IconRefresh, IconStop,IconSpinner } from '@/components/ui/icons'
import { FooterText } from '@/components/footer'

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    | 'append'
    | 'isLoading'
    | 'reload'
    | 'messages'
    | 'stop'
    | 'input'
    | 'setInput'
    | 'data'
  > {
  id?: string
  title?: string
  setPreviewToken: ({ llm_api_key, llm_model, llm_base_url, search_api_key, bing_api_key }: { llm_api_key: string, llm_model: string, llm_base_url: string, search_api_key: string, bing_api_key: string }) => void
}

export function ChatPanel({
  id,
  title,
  isLoading,
  stop,
  append,
  reload,
  input,
  setInput,
  messages,
  setPreviewToken
}: ChatPanelProps) {

  return (
    <div className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b from-muted/30 from-0% to-muted/30 to-50% animate-in duration-300 ease-in-out dark:from-background/10 dark:from-10% dark:to-background/80 peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pl-[300px]">
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-3xl sm:px-4">
        <div className="flex items-center justify-center h-12">
          {isLoading ? (
            <Button
              variant="outline"
              onClick={() => stop()}
              className="bg-background"
            >
              <IconSpinner className="mr-2" />
              Generating ... ■
            </Button>
          ) : (
            messages?.length >= 2 && (
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => reload()}>
                  <IconRefresh className="mr-2" />
                  Regenerate response
                </Button>
                {id && title ? (
                  <>
                    
                  </>
                ) : null}
              </div>
            )
          )}
        </div>
        <div className="px-4 py-2 space-y-4 border-t shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={async value => {
              var prompt=value
              if(value.startsWith('@')){
                prompt=value.slice(prompt.split(' ')[0].length+1)
                localStorage.setItem('latestAsk', prompt);
                prompt = localStorage.getItem('AgentPrompt')+':\n'+prompt
              }else{
                localStorage.setItem('latestAsk', value);
              }
              const token=localStorage.getItem('ai-token')
              if(token){
                var tokenjson=JSON.parse(token)
                tokenjson['usetool']=localStorage.getItem('usetool')
                console.log(tokenjson)
                setPreviewToken(tokenjson)
              }
              await append({
                id,
                content: prompt,
                role: 'user'
              })
              localStorage.removeItem('usetool')
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}
