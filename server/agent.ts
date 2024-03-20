import { StreamingTextResponse } from "ai";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { TavilySearchResults } from "./custom/tools/tavily/tavily_search";
import { BingSerpAPI } from "./custom/tools/bing/bingserpapi";
import { GoogleCustomSearch } from "./custom/tools/google/google_custom_search";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const convertMessageToLangChainMessage = (message: any) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } 
};


export async function Chat(body: any) {
    process.env.TAVILY_API_KEY = body.previewToken.tavilyserp_api_key;
    process.env.GOOGLE_API_KEY = body.previewToken.google_api_key;
    process.env.GOOGLE_CSE_ID = body.previewToken.google_cse_id;
    const messages = (body.messages ?? []).filter(
      (message: any) =>
        message.role === "user" || message.role === "assistant",
    ).map(convertMessageToLangChainMessage);
    const model = new ChatOpenAI({
        temperature: 0.7,
        modelName: body.previewToken.llm_model || 'gpt-3.5-turbo-0125',
        openAIApiKey: body.previewToken.llm_api_key,
        configuration: { baseURL: body.previewToken?.llm_base_url || 'https://api.openai.com/v1' },
        maxTokens: 2048,
        streaming: true
      });
    if(!body.messages.slice(-1)[0].function_call){
      const outputParser = new HttpResponseOutputParser()
      const stream = await model.pipe(outputParser).stream(messages);
      return new StreamingTextResponse(stream);
    }
    console.log(body)
    const previousMessages = messages
      .slice(0, -1)
    const currentMessageContent = messages[messages.length - 1].content;
    console.log(previousMessages,currentMessageContent)

    var tools: any[] = [];
    if (body.previewToken.tavilyserp_api_key) {
      tools.push(new TavilySearchResults({maxResults: 5}));
    }
    if (body.previewToken.bing_api_key) {
      tools.push(new BingSerpAPI(body.previewToken.bing_api_key));
    }
    if (body.previewToken.google_api_key) {
      tools.push(new GoogleCustomSearch());
    }

    const AGENT_SYSTEM_PROMPT = 'You are a helpful assistant.'
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", AGENT_SYSTEM_PROMPT],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm:model,
      tools,
      prompt,
    });
    
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });


      const logStream = await agentExecutor.streamLog({
        input: currentMessageContent,
        chat_history: previousMessages,
      });

      const encoder = new TextEncoder()
  
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const chunk of logStream) {
            if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
              const addOp = chunk.ops[0];
              // console.log(addOp.path,addOp.value)
              if (addOp.path.startsWith("/logs/ChatOpenAI") && addOp.path.includes("stream") &&
                typeof addOp.value === "string" &&
                addOp.value.length
              ) {
                controller.enqueue(encoder.encode(addOp.value));
              }
              if(addOp.path.startsWith('/logs/BingSerpAPI/final_output') || addOp.path.startsWith('/logs/GoogleCustomSearch/final_output') || addOp.path.startsWith('/logs/TavilySearchResults/final_output')){
                controller.enqueue(encoder.encode('\n\n---\n\n'+ addOp.value.output.split('\n\n').map((line:string)=>line.split(']')[1]).join('\n\n') +'---\n\n'));
              }
            }
          }
          controller.close();
        },
      });
    
      return new StreamingTextResponse(transformStream);
}