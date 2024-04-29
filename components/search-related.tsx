'use client'

import React from 'react'
import { Button } from './ui/button'
import { ArrowRight } from 'lucide-react'
import { useActions, useStreamableValue, useUIState } from 'ai/rsc'
import { AI } from '@/app/action'
import { UserMessage } from './user-message'
import { PartialRelated } from '@/lib/schema/related'
import {useSetting} from '@/lib/hooks/use-setting'

export interface SearchRelatedProps {
  relatedQueries: PartialRelated
}

export const SearchRelated: React.FC<SearchRelatedProps> = ({
  relatedQueries
}) => {
  const { submit } = useActions<typeof AI>()
  const [, setMessages] = useUIState<typeof AI>()
  const [data, error, pending] =
    useStreamableValue<PartialRelated>(relatedQueries)
  const [keys, setKeys]  = useSetting();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget as HTMLFormElement)

    // // Get the submitter of the form
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLInputElement
    let query = ''
    if (submitter) {
      formData.append(submitter.name, submitter.value)
      query = submitter.value
    }

    const userMessage = {
      id: Date.now(),
      component: <UserMessage message={query} isFirstMessage={false} />
    }
    const apikeys = {'llm_api_key':keys.current.llm_api_key,'llm_base_url':keys.current.llm_base_url,'llm_model':keys.current.llm_model,'tavilyserp_api_key':keys.current.tavilyserp_api_key}
    const skip=undefined
    const responseMessage = await submit(formData,skip,apikeys)
    setMessages(currentMessages => [
      ...currentMessages,
      userMessage,
      responseMessage
    ])
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap">
      {data?.items
        ?.filter((item:any) => item?.query !== '')
        .map((item, index) => (
          <div className="flex items-start w-full" key={index}>
            <ArrowRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-accent-foreground/50" />
            <Button
              variant="link"
              className="flex-1 justify-start px-0 py-1 h-fit font-semibold text-accent-foreground/50 whitespace-normal text-left"
              type="submit"
              name={'related_query'}
              value={item?.query}
            >
              {item?.query}
            </Button>
          </div>
        ))}
    </form>
  )
}

export default SearchRelated
