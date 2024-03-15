import { StreamingTextResponse} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate,  MessagesPlaceholder} from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { BingSerpAPI } from "./custom/tools/bing/bingserpapi";
import { ChatGoogleGenerativeAI } from "./custom/llm/gemini";
import { HttpResponseOutputParser } from "langchain/output_parsers";
import { AIMessage, ChatMessage, HumanMessage } from "@langchain/core/messages";


const convertMessageToLangChainMessage = (message: any) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

export async function Chat(body: any) {
  // console.log(body)
  const messages = (body.messages ?? []).filter(
    (message: any) =>
      message.role === "user" || message.role === "assistant",
  ).map(convertMessageToLangChainMessage);;
  process.env.TAVILY_API_KEY = body.previewToken.search_api_key
  var model:any
  if(body.previewToken.llm_model==='gemini-pro'){
      model = new ChatGoogleGenerativeAI({
        apiKey: body.previewToken.llm_api_key,
        baseURL: body.previewToken?.llm_base_url || null,
        modelName: "gemini-pro",
        maxOutputTokens: 8192,
    });
  }else{
    model = new ChatOpenAI({
      temperature: 0.2,
      modelName: body.previewToken.llm_model || 'gpt-3.5-turbo-0125',
      openAIApiKey: body.previewToken.llm_api_key,
      configuration: { baseURL: body.previewToken?.llm_base_url || 'https://api.openai.com/v1' },
      maxTokens: 2048,
      streaming: true
    });
  }
  
  if(!body.messages.slice(-1)[0].function_call){
    const outputParser = new HttpResponseOutputParser()
    const stream = await model.pipe(outputParser).stream(messages);
    return new StreamingTextResponse(stream);
  }

  const tools = body.previewToken.bing_api_key ? [new BingSerpAPI(body.previewToken.bing_api_key)] : [new TavilySearchResults({ maxResults: 5 })];
  var SYSTEM_TEMPLATE = `You are an helpful assistant with Thought:{tools}

Now Think: do I need a tool? if yes:
call a tool name of {tool_names} and MUST in format:
\`\`\`
Action: a tool name (just text , no need brackets)
Action Input: key words ripped from {input}
\`\`\`
then stop output and wait for user input.

if NO,output in format(MUST):

Final Answer: final answer in ${body.locale}

---
{agent_scratchpad}
---

Now think on the query:
`

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", "{input}"],
  ]);
  
  const agent = await createReactAgent({
    llm: model,
    tools,
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    returnIntermediateSteps: true,
    verbose: false
  });
  const previousMessages = messages.slice(0, -1)
  const currentMessageContent = messages[messages.length - 1].content;
  const logStream = await agentExecutor.streamLog({
    input: currentMessageContent,
    chat_history: previousMessages,
    handle_parsing_errors: false,
    verbose: false
  });
  const encoder = new TextEncoder()
  
  const transformStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of logStream) {
        if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
          const addOp = chunk.ops[0];
          if (addOp.path.startsWith("/logs/googlegenerativeai:2/stream") ||
            addOp.path.startsWith("/logs/ChatOpenAI") &&
            typeof addOp.value === "string" &&
            addOp.value.length
          ) {
            controller.enqueue(encoder.encode(addOp.value));
          }
          if(addOp.path.startsWith('/logs/BingSerpAPI/final_output')){
            controller.enqueue('\n\n---\n\n'+addOp.value.output+'\n\n---\n\n');
          }
        }
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(transformStream);
}