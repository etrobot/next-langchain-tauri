import { Message as VercelChatMessage, StreamingTextResponse,OpenAIStream } from 'ai';
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { pull } from "langchain/hub";
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from "@langchain/core/prompts";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { nanoid } from '../lib/utils';
import { LLMResult } from '@langchain/core/outputs';
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import OpenAI from 'openai'

const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

class MyCallbackHandler extends BaseCallbackHandler {
  private body: any;
  private userId: string;
  constructor(requestBody: any, userId: string) {
    super();
    this.body = requestBody;
    this.userId = userId;
  }
  name = "MyCallbackHandler";
  async handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string | undefined, tags?: string[] | undefined) {
    const title = this.body.messages[0].content.substring(0, 100)
    const id = this.body.id ?? nanoid()
    const createdAt = Date.now()
    const path = `/chat/${id}`
    const payload = {
      id,
      title,
      userId:this.userId,
      createdAt,
      path,
      messages: [
        ...this.body.messages,
        {
          content: output.generations[0][0].text,
          role: 'assistant'
        }
      ]
    }
    // console.log(payload)
  }
}
// Assuming your utility and class definitions remain unchanged
const openai = new OpenAI({ apiKey: 'dummy' })
export async function pureChat(body:any) {
  openai.apiKey=body.previewToken.llm_api_key;
  openai.baseURL = body.previewToken.llm_base_url || 'https://api.openai.com/v1' ;
  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0125',
    messages:body.messages,
    temperature: 0.7,
    stream: true
  })
  const stream = OpenAIStream(res)
  return new StreamingTextResponse(stream)
}

export async function searchAgent(body:any) {
    console.log(body)
    const messages = body.messages;
    const previousMessages = messages.slice(0, -1).map(convertVercelMessageToLangChainMessage);
    const currentMessageContent = messages[messages.length - 1].content;

    process.env.SERPAPI_API_KEY = body.previewToken.serp_api_key

    const tools = [new SerpAPI()];
    const prompt = await pull<PromptTemplate>("hwchase17/react");
    const model = new ChatOpenAI({
      temperature: 0.1,
      modelName: 'gpt-3.5-turbo-0125',
      openAIApiKey: body.previewToken.llm_api_key,
      configuration: { baseURL: body.previewToken?.llm_base_url || 'https://api.openai.com/v1' },
      streaming: true
    });
    const userId = '123456789'; 
    
    const myCallback = new MyCallbackHandler(body, userId);
    
    const agent = await createReactAgent({
      llm: model,
      tools,
      prompt,
    });
  
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      returnIntermediateSteps: false,
    });
  
    const logStream = await agentExecutor.streamLog({
      input: currentMessageContent,
      chat_history: previousMessages,
    }, {
        callbacks: [myCallback]
    });
  
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of logStream) {
          if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
            const addOp = chunk.ops[0];
            if (
              addOp.path.startsWith("/logs/ChatOpenAI") &&
              typeof addOp.value === "string" &&
              addOp.value.length
            ) {
              controller.enqueue(addOp.value);
            }
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(transformStream);
}