import { StreamingTextResponse,Message} from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createReactAgent } from "langchain/agents";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { BingSerpAPI } from "./custom/tools/bing/bingserpapi";
import { ToolExecutor } from "@langchain/langgraph/prebuilt";
import { convertToOpenAIFunction } from "@langchain/core/utils/function_calling";
import { FunctionMessage,BaseMessage,HumanMessage} from "@langchain/core/messages";
import { AgentAction } from "@langchain/core/agents";
import { StateGraph, END } from "@langchain/langgraph";
import { RunnableLambda } from "@langchain/core/runnables";
import { ChatGoogleGenerativeAI } from "./custom/llm/gemini";
import { StringOutputParser } from "@langchain/core/output_parsers";


export async function Chat(body: any) {
  console.log(body)
  const messages = body.messages.map((message:any) => {
      return [message.role,message.content]
    });
  const currentMessageContent = messages.slice(-1)[0]+'\n reply in'+body.locale;
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
      streaming: true
    });
  }
  if(!body.previewToken.usetool){
    const parser = new StringOutputParser();
    const stream = await model.pipe(parser).stream(messages);
    return new StreamingTextResponse(stream);
  }else if(!body.previewToken.bing_api_key&&!body.previewToken.search_api_key){
    return { error: "Unauthorized Search Key", status: 401 };
  }

  const tools = body.previewToken.bing_api_key ? [new BingSerpAPI(body.previewToken.bing_api_key)] : [new TavilySearchResults({ maxResults: 5 })];
  var SYSTEM_TEMPLATE = `
  you has access to the following tools:
  {tools}
  To use a tool in neccessary, please use the following format:
  \`\`\`markdown
  Thought: Do I need to use a tool? Yes
  Action: the action to take, should be one of [{tool_names}]
  Action Input: the input to the action
  Observation: the result of the action
  \`\`\`
  When you have a response to say to the Human, or if you do not need to use a tool, you MUST use the format:
  \`\`\`markdown
  Thought: Do I need to use a tool? No
  \`\`\`
  Final Answer: [your response here in ${body.locale}]
  Begin!
  Previous conversation history:
  {chat_history}
  New input: {input}
  {agent_scratchpad}`

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    ["human", "{input}"],
  ]);
  
  const userId = '123456789';

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
    chat_history: messages.slice(1)
  });

  const transformStream = new ReadableStream({
    async start(controller) {
      for await (const chunk of logStream) {
        if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
          const addOp = chunk.ops[0];
          // console.log(addOp)
          if (
            addOp.path.startsWith("/logs/ChatOpenAI") &&
            typeof addOp.value === "string" &&
            addOp.value.length
          ) {
            controller.enqueue(addOp.value);
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


export async function Agents(body: any) {
  process.env.TAVILY_API_KEY = body.previewToken.search_api_key
  const tools = body.previewToken.bing_api_key ? [new BingSerpAPI(body.previewToken.bing_api_key)] : [new TavilySearchResults({ maxResults: 5 })];
  const toolExecutor = new ToolExecutor({
    tools,
  });
  const model = new ChatOpenAI({
    temperature: 0.2,
    modelName: body.previewToken.llm_model || 'gpt-3.5-turbo-0125',
    openAIApiKey: body.previewToken.llm_api_key,
    configuration: { baseURL: body.previewToken?.llm_base_url || 'https://api.openai.com/v1' },
    streaming: true
  });
  const toolsAsOpenAIFunctions = tools.map((tool) =>
    convertToOpenAIFunction(tool)
  );
  const newModel = model.bind({
    functions: toolsAsOpenAIFunctions,
  });
  const agentState = {
    messages: {
      value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
      default: () => [],
    },
  };

  // Define the function that determines whether to continue or not
  const shouldContinue = (state: { messages: Array<BaseMessage> }) => {
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    // If there is no function call, then we finish
    if (
      !("function_call" in lastMessage.additional_kwargs) ||
      !lastMessage.additional_kwargs.function_call
    ) {
      return "end";
    }
    // Otherwise if there is, we continue
    return "continue";
  };

  // Define the function to execute tools
  const _getAction = (state: { messages: Array<BaseMessage> }): AgentAction => {
    const { messages } = state;
    // Based on the continue condition
    // we know the last message involves a function call
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) {
      throw new Error("No messages found.");
    }
    if (!lastMessage.additional_kwargs.function_call) {
      throw new Error("No function call found in message.");
    }
    // We construct an AgentAction from the function_call
    return {
      tool: lastMessage.additional_kwargs.function_call.name,
      toolInput: JSON.stringify(
        lastMessage.additional_kwargs.function_call.arguments
      ),
      log: "",
    };
  };

  // Define the function that calls the model
  const callModel = async (state: { messages: Array<BaseMessage> }) => {
    const { messages } = state;
    const response = await newModel.invoke(messages);
    // We return a list, because this will get added to the existing list
    return {
      messages: [response],
    };
  };

  const callTool = async (state: { messages: Array<BaseMessage> }) => {
    const action = _getAction(state);
    // We call the tool_executor and get back a response
    const response = await toolExecutor.invoke(action);
    // We use the response to create a FunctionMessage
    const functionMessage = new FunctionMessage({
      content: response,
      name: action.tool,
    });
    // We return a list, because this will get added to the existing list
    return { messages: [functionMessage] };
  };
  // Define a new graph
  const workflow = new StateGraph({
    channels: agentState,
  });

  // Define the two nodes we will cycle between
  workflow.addNode("agent", new RunnableLambda({ func: callModel }));
  workflow.addNode("action", new RunnableLambda({ func: callTool }));

  // Set the entrypoint as `agent`
  // This means that this node is the first one called
  workflow.setEntryPoint("agent");

  // We now add a conditional edge
  workflow.addConditionalEdges(
    // First, we define the start node. We use `agent`.
    // This means these are the edges taken after the `agent` node is called.
    "agent",
    // Next, we pass in the function that will determine which node is called next.
    shouldContinue,
    // Finally we pass in a mapping.
    // The keys are strings, and the values are other nodes.
    // END is a special node marking that the graph should finish.
    // What will happen is we will call `should_continue`, and then the output of that
    // will be matched against the keys in this mapping.
    // Based on which one it matches, that node will then be called.
    {
      // If `tools`, then we call the tool node.
      continue: "action",
      // Otherwise we finish.
      end: END,
    }
  );

  // We now add a normal edge from `tools` to `agent`.
  // This means that after `tools` is called, `agent` node is called next.
  workflow.addEdge("action", "agent");

  // Finally, we compile it!
  // This compiles it into a LangChain Runnable,
  // meaning you can use it as you would any other runnable
  const app = workflow.compile();
  const inputs = {
    messages: [new HumanMessage(body.messages[body.messages.length - 1].content)],
  };
  // const result = await app.invoke(inputs);
  const logStream = await app.streamLog(inputs)
  const transformStream = new ReadableStream({
    async start(controller) {
      var temp=''
      for await (const chunk of logStream) {
        if (chunk.ops?.length > 0 && chunk.ops[0].op === "add") {
          const addOp = chunk.ops[0];
          // console.log(addOp)
          if (
            addOp.path.startsWith("/logs/ChatOpenAI") &&
            typeof addOp.value === "string" &&
            addOp.value.length
          ) {
            if (temp !== addOp.value) {
              temp=addOp.value
              continue
            }
            controller.enqueue(addOp.value);
          }
        }
      }
      controller.close();
    },
  });

  return new StreamingTextResponse(transformStream);
}