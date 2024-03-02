import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";
import { pull } from "langchain/hub";
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from "@langchain/core/prompts";
import { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { nanoid } from '../lib/utils';
import { LLMResult } from '@langchain/core/outputs';
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { BingSerpAPI } from "@langchain/community/tools/bingserpapi";
import { TextEncoder } from 'util';
import{ FastifyRequest } from 'fastify';

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

export async function searchAgent(request:FastifyRequest) {
    console.log(request.body)
    const body = request.body as any; // Ensure proper typing
    const messages = body.messages;
    const previousMessages = messages.slice(0, -1).map(convertVercelMessageToLangChainMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    const tools = [new BingSerpAPI(body.previewToken.serp_api_key)];
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
  
    const textEncoder = new TextEncoder();
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
                  controller.enqueue(textEncoder.encode(addOp.value));
                }
              }
            }
            controller.close();
          },
        });
  
        return new StreamingTextResponse(transformStream);
}