'use client'

import { type Message } from 'ai'
import { Textarea } from "@/components/ui/textarea"
import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy,IconEdit,IconDownload } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { useSearchParams,useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
  const [dark,setDark]=useState(false)
  useEffect(()=>{
    const darkFromStorage = localStorage.getItem('theme');
    if (darkFromStorage === 'dark') {
      setDark(true)
    }else if(darkFromStorage==='system'){
      setDark(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    }else{
      setDark(false)}
  });
  const [fromCovers,setFromCovers] = useState(false)
  const [msgEditorOpen, setMsgEditorOpen] = useState(false)
  const [coversOpen, setCoversOpen] = useState(false)
  const [msg,setMsg]=useState(message.content)
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const params = useSearchParams()
  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(message.content)
  }

  const sections = msg.split('\n\n');
  const covers = sections.reduce<{ title: string; content: string; }[]>((accumulator, section, index) => {
    const titleMatches = section.match(/\*\*(.*?)\*\*/g);
    if (titleMatches) {
      const title = titleMatches.map(match => match.replace(/\*\*(.*?)\*\*/, '$1')).join('\n');
      const content = section.split('**').slice(-1)[0];
      accumulator.push({ title, content });
    }
    return accumulator;
  }, []);
  const Cover = ({ title, content, id,dark }: { title: string; content: string; id: string,dark: boolean }) => {
    const [background, setBackground] = useState(getRandomGradient(dark));

    const refreshBackground = () => {
      setBackground(getRandomGradient(dark));
    };
  
    const downloadImage = async (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        const buttons = element.querySelectorAll('button');
        buttons.forEach(btn => btn.style.visibility = 'hidden');
        toPng(element, { cacheBust: true })
          .then((dataUrl) => {
            download(dataUrl, `${title}.png`);
            buttons.forEach(btn => btn.style.visibility = 'visible');
          })
          .catch((error) => {
            console.error('Could not download the image', error);
            buttons.forEach(btn => btn.style.visibility = 'visible');
          });
        
      }
    };
  
    return (
        <Card id={`agent-${id}`} key={id}
              className={dark ? "w-[300px] h-[400px] flex-shrink-0 text-white z-99" : "w-[300px] h-[400px] flex-shrink-0 text-black z-99"}
              style={{ background }}>
              <CardHeader className='h-[360px] w-[300px]'>
                <CardTitle><pre style={{ lineHeight: "1.5" }}>{title}</pre></CardTitle>
                <br/>
                {content}
              </CardHeader>
              <CardFooter className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={refreshBackground}>🎨</Button>
                <Button variant="ghost" size="icon" onClick={() => downloadImage(`agent-${id}`)}><IconDownload /></Button>
              </CardFooter>
            </Card>
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
       <Button variant="ghost" size="icon" onClick={() => setCoversOpen(true)}>
        C
     </Button></>}
      <Button variant="ghost" size="icon" onClick={onCopy}>
        {isCopied ? <IconCheck /> : <IconCopy />}
        <span className="sr-only">Copy message</span>
      </Button>
      </div>
      <Dialog open={msgEditorOpen} onOpenChange={()=>{
          setMsgEditorOpen(!msgEditorOpen);
          if(fromCovers){
            setFromCovers(false);
            setCoversOpen(true);
          }
        }}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Edit Message</DialogTitle>
            </DialogHeader>
            <Textarea className="col-span-4 h-[420px]"
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
                      const newChat = msgJson.map((m: Message) => m.content === message.content ? { ...m, content: msg } : m);
                      localStorage.setItem(cid, JSON.stringify(newChat));
                      if(fromCovers){
                        setFromCovers(false);
                        setCoversOpen(true);
                      }else{window.location.reload();}
                    }
                  }
            }}>Save Message</Button>
            <Button variant="ghost" onClick={() => setMsg(message.content)}>Reset</Button>
          </DialogContent>
        </Dialog>
        <Dialog open={coversOpen} onOpenChange={setCoversOpen} >
          <DialogContent className="sm:max-w-4xl h-[560px]">
            <DialogHeader>
              <DialogTitle>Covers 
                <Button className='mx-1' variant="outline"  onClick={() => {setCoversOpen(false);setMsgEditorOpen(true);setFromCovers(true)}}>Edit Texts</Button> 
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-nowrap overflow-x-auto">
            {covers.map((cover, index) => (
              <Cover
                key={index}
                title={cover.title}
                content={cover.content}
                id={`cover-${index}`}
                dark={dark}
              />
            ))}
          </div>
          </DialogContent>
        </Dialog>
    </div>
  )
}
