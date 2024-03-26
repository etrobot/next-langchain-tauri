'use client'

import { type Message } from 'ai'
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy,IconEdit } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { useSearchParams,useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
  message: Message
}

export function ChatMessageActions({
  message,
  className,
  ...props
}: ChatMessageActionsProps) {
  const router = useRouter()
  const [msgEditorOpen, setMsgEditorOpen] = useState(false)
  const [msg,setMsg]=useState(message.content)
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const params = useSearchParams()
  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(message.content)
  }

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <Button variant="ghost" size="icon" onClick={() =>{
        setMsg(message.content);
        setMsgEditorOpen(true);
      }}>
        <IconEdit />
        <span className="sr-only">Edit message</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>

      <Dialog open={msgEditorOpen} onOpenChange={setMsgEditorOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
            </DialogHeader>
            <Textarea className="col-span-4 h-[200px]"
              value={msg}
              onChange={(e) => { setMsg(e.target.value) }}
            />
            <Button onClick={()=>{
                  const cid= params!.get('cid');
                  if(cid){
                    const msgTxt = localStorage.getItem(cid);
                    if(msgTxt){
                      setMsgEditorOpen(false);
                      localStorage.setItem(cid, msgTxt.replace(message.content, msg));
                      window.location.reload();
                    }
                  }
            }}>Save Message</Button>
            <Button variant="ghost" onClick={() => setMsg(message.content)}>Reset</Button>
          </DialogContent>
        </Dialog>
    </div>
  )
}
