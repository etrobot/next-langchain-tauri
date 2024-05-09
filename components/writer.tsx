'use client'
import { Button } from "@/components/ui/button"
import { useState, useTransition, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { IconSpinner,IconSeparator} from '@/components/ui/icons'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useRouter } from 'next/navigation'
import { useChat, type Message } from 'ai/react'
import { toast } from 'react-hot-toast'
import {initialKeyScheme } from '@/lib/hooks/use-setting'
import {KeyScheme} from '@/lib/types'
type Paragraph = {
  id: string,
  reference: string,
  prompt: string,
  genTxt: string
}
type Article={
  p:Paragraph[]
}

export function Writer() {
  const router = useRouter();
  const [dialogType,setDialogType] = useState('task');
  const [loading, setLoading] = useState(false);
  const [importWriterOpen, setImportWriterOpen] = useState(false);
  const [initialText, setInitialText] = useState('');
  const [sources, setSources] = useState('');
  const [article, setArticle] = useLocalStorage<Article>('article', { p: [] });
  const initialParagraph: Paragraph= {
    id: '',
    reference: '',
    prompt: '',
    genTxt: ''
  }
  const [editingParagraph, setEditingParagraph] = useState<Paragraph>(initialParagraph);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState('prompt');
  const [keyScheme, setKeyScheme] = useLocalStorage<KeyScheme>('ai-token', initialKeyScheme);
  const { messages,setMessages,append,stop, isLoading} =
    useChat({
      api: process.env.NEXT_PUBLIC_API_URL + '/api/retrieval/chat',
      id:'123',
      body: {
        previewToken:keyScheme.current,
        locale: navigator.language,
      },
      onResponse(response) {
        if (response.status !== 200) {
          toast.error(`${response.status} ${response.statusText}`);
        }
        const sourcesHeader = response.headers.get("x-sources");
        setSources((Buffer.from(sourcesHeader ?? '', 'base64')).toString('utf8'));
      },
      onFinish(response) {
        setEditingParagraph({...editingParagraph,genTxt:response.content+'\n\n'+sources});
      }
    })

  const handleEditClick = (paragraph: Paragraph, key:string) => {
    setEditingParagraph(paragraph);
    setCurrentRow(key);
    setEditDialogOpen(true);
    setDialogType('task');
  };


  const handleNewTaskClick = () => {
    const sections = initialText.split('\n\n').filter(Boolean);
    const newArticle = sections.map((section,index) => ({
      id: `${index}`,
      reference: `${section}`,
      prompt:`根据以上要求尽可能多的列出所有相关内容和数字(若有)`,
      genTxt: ``,
    }));
    setArticle({ p: newArticle });
    setImportWriterOpen(false);
  };

  const handleVectorStoreClick = async () => {
    setLoading(true);
    const response = await fetch("/api/retrieval/ingest", {
      method: "POST",
      body: JSON.stringify({
        text: initialText,
        llm_api_key: keyScheme.current.llm_api_key,
        llm_base_url: keyScheme.current.llm_base_url
      })
    });
    if (response.status === 200) {
      toast("Uploaded!");
      setLoading(false);
      setImportWriterOpen(false);
    } else {
      const json = await response.json();
      if (json.error) {
        toast(json.error);
      }
    }

  };

  return (
    <>
    <div className='w-full flex justify-end h-[40px]'>
    <Button className="text-xs" variant={"link"} onClick={() => {setDialogType('retrieval');setImportWriterOpen(true);}}>Retrieve</Button>
    <IconSeparator className='my-2' />
    <Button variant="link" className='text-xs ' onClick={() => { navigator.clipboard.writeText((article.p.map((p) => p.genTxt)).join('\n\n')); toast.success('The article is copied to clipboard') }}>Export Gen</Button>
        <IconSeparator className='my-2' />
      <Button className="text-xs" variant={"link"} onClick={() => {setDialogType('task');setImportWriterOpen(true) }}>Import Task</Button>
      </div>
      <Dialog open={importWriterOpen} onOpenChange={setImportWriterOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Import Reference</DialogTitle>
          </DialogHeader>
          <Textarea className="col-span-4 h-[400px]"
            value={initialText || ''}
            onChange={(e) => { setInitialText(e.target.value) }}
          />
          { dialogType === 'task' && <Button onClick={handleNewTaskClick}>New Task</Button>}
          { dialogType === 'retrieval' && <Button onClick={handleVectorStoreClick}>{loading?'UPLoading...':'Retrieve'}</Button>}
        </DialogContent>
      </Dialog>
      <Table>
      <TableCaption>EOF</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[30px]">Id</TableHead>
          <TableHead className="w-[300px]">Reference</TableHead>
          <TableHead className="w-[300px]">Prompt</TableHead>
          <TableHead className="w-[300px]">GenTxt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {article.p.map((paragraph) => (
          <TableRow key={paragraph.id}>
            <TableCell className="align-top">{paragraph.id}</TableCell>
            <TableCell className="align-top"><Button onClick={() => {handleEditClick(paragraph, 'reference')}}>Edit</Button><br/>{paragraph.reference}</TableCell>
            <TableCell className="align-top"><Button onClick={() => {handleEditClick(paragraph, 'prompt')}}>Edit</Button><br/>{paragraph.prompt}</TableCell>
            <TableCell className="align-top"><Button onClick={() => {handleEditClick(paragraph, 'genTxt')}}>Edit</Button><br/>{paragraph.genTxt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <Tabs defaultValue={currentRow}>
            <TabsList className="grid w-full grid-cols-3">
              {Object.keys(initialParagraph).slice(1).map((pkey) => (
                <TabsTrigger value={pkey}>{pkey}</TabsTrigger>
              ))}
            </TabsList>
            {Object.keys(initialParagraph).slice(1).map((pkey: string) => (
              <TabsContent value={pkey}>
                <Textarea className="h-[400px]"
                      value={editingParagraph[pkey as keyof Paragraph] || ''}
                      onChange={e => {
                        const newParagraph = { ...editingParagraph };
                        newParagraph[pkey as keyof Paragraph] = e.target.value;
                        setEditingParagraph(newParagraph);
                      }}
                    />

                <DialogFooter className='py-2'>
                {pkey === 'genTxt' && <Button variant="outline" onClick={()=>{
                    if(editingParagraph.prompt.length<10){
                      toast.error('Too short for AI prompt optimization')
                      return;
                    }
                    setMessages([]);
                    append({
                    id: '123',
                    content: editingParagraph.reference+'\n\n'+editingParagraph.prompt,
                    role: 'user'
                  })}}>{isLoading?<IconSpinner/>:"AI"}</Button>}
                  <Button
                    onClick={() => {
                      // set editing paragraph to article
                      const newArticle = { ...article };
                      newArticle.p = newArticle.p.map(paragraph => {
                        if (paragraph.id === editingParagraph.id) {
                          return editingParagraph;
                        }
                        return paragraph;
                      });
                      setArticle(newArticle);
                      localStorage.setItem('writer', JSON.stringify(article));
                      router.refresh();
                      setEditDialogOpen(false);
                    }}
                  >
                    Save Article
                  </Button>
                </DialogFooter>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}