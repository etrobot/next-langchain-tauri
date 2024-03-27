'use client'

import { type Message } from 'ai'
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy,IconEdit } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { useSearchParams,useRouter } from 'next/navigation'
import { useState } from 'react'
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { getRandomGradient } from '@/lib/utils'
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
  const [cardsOpen, setCardsOpen] = useState(false)
  const [msg,setMsg]=useState(message.content)
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const params = useSearchParams()
  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(message.content)
  }

  const sections = message.content.split('\n\n');
  const cards = sections.map((section, index) => {
    const titleMatch = section.match(/\*\*(.*?)\*\*/);
    const title = titleMatch ? titleMatch[1] : `Section ${index + 1}`;
    const content = section.replace(/\*\*(.*?)\*\*/, '').trim();
    return { title, content };
  });
  const Card = ({ title, content, id }: { title: string; content: string; id: string }) => {
    const [background, setBackground] = useState(getRandomGradient(false));
  
    const refreshBackground = () => {
      setBackground(getRandomGradient(false));
    };
  
    const downloadImage = async (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        toPng(element, { cacheBust: true })
          .then((dataUrl) => {
            download(dataUrl, `${title}.png`);
          })
          .catch((error) => {
            console.error('Could not download the image', error);
          });
      }
    };
  
    return (
      <div
        id={id}
        className="flex-shrink-0 w-64 h-64 p-4 m-2 rounded shadow-lg overflow-hidden"
        style={{ background }}
      >
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm">{content}</p>
        <div className="mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={refreshBackground}
          >
            Refresh Background
          </button>
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-2"
            onClick={() => downloadImage(id)}
          >
            Download as Image
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
        className
      )}
      {...props}
    >
      <div className='w-[16px]'>
      { message.content.includes('\n') &&<> <Button variant="ghost" size="icon" onClick={() =>{
        setMsg(message.content);
        setMsgEditorOpen(true);
      }}>
        <IconEdit />
        <span className="sr-only">Edit message</span>
      </Button>
       <Button variant="ghost" size="icon" onClick={() => setCardsOpen(true)}>
        C
     </Button></>}
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      </div>
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
                      const msgJson = JSON.parse(msgTxt);
                      localStorage.setItem(cid, JSON.stringify(msgJson.map((m: Message) => m.content === message.content ? { ...m, content: msg } : m)));
                      window.location.reload();
                    }
                  }
            }}>Save Message</Button>
            <Button variant="ghost" onClick={() => setMsg(message.content)}>Reset</Button>
          </DialogContent>
        </Dialog>
        <Dialog open={cardsOpen} onOpenChange={setCardsOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Cards</DialogTitle>
            </DialogHeader>
            <div className="flex space-x-4">
            {cards.map((card, index) => (
              <Card
                key={index}
                title={card.title}
                content={card.content}
                id={`card-${index}`}
              />
            ))}
          </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}
