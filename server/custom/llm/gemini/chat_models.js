import { GoogleGenerativeAI as GenerativeAI, } from "@fuyun/generative-ai";
import { getEnvironmentVariable } from "@langchain/core/utils/env";
import { BaseChatModel, } from "@langchain/core/language_models/chat_models";
import { convertBaseMessagesToContent, convertResponseContentToChatGenerationChunk, mapGenerateContentResultToChatResult, } from "./utils.js";
/**
 * A class that wraps the Google Palm chat model.
 * @example
 * ```typescript
 * const model = new ChatGoogleGenerativeAI({
 *   apiKey: "<YOUR API KEY>",
 *   temperature: 0.7,
 *   modelName: "gemini-pro",
 *   topK: 40,
 *   topP: 1,
 * });
 * const questions = [
 *   new HumanMessage({
 *     content: [
 *       {
 *         type: "text",
 *         text: "You are a funny assistant that answers in pirate language.",
 *       },
 *       {
 *         type: "text",
 *         text: "What is your favorite food?",
 *       },
 *     ]
 *   })
 * ];
 * const res = await model.call(questions);
 * console.log({ res });
 * ```
 */
export class ChatGoogleGenerativeAI extends BaseChatModel {
    static lc_name() {
        return "googlegenerativeai";
    }
    get lc_secrets() {
        return {
            apiKey: "GOOGLE_API_KEY",
        };
    }
    get _isMultimodalModel() {
        return this.modelName.includes("vision");
    }
    constructor(fields) {
        super(fields ?? {});
        Object.defineProperty(this, "lc_serializable", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: true
        });
        Object.defineProperty(this, "modelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "gemini-pro"
        });
        Object.defineProperty(this, "temperature", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // default value chosen based on model
        Object.defineProperty(this, "maxOutputTokens", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "topP", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // default value chosen based on model
        Object.defineProperty(this, "topK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // default value chosen based on model
        Object.defineProperty(this, "stopSequences", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "safetySettings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "apiKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "streaming", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.modelName =
            fields?.modelName?.replace(/^models\//, "") ?? this.modelName;
        this.maxOutputTokens = fields?.maxOutputTokens ?? this.maxOutputTokens;
        if (this.maxOutputTokens && this.maxOutputTokens < 0) {
            throw new Error("`maxOutputTokens` must be a positive integer");
        }
        this.temperature = fields?.temperature ?? this.temperature;
        if (this.temperature && (this.temperature < 0 || this.temperature > 1)) {
            throw new Error("`temperature` must be in the range of [0.0,1.0]");
        }
        this.topP = fields?.topP ?? this.topP;
        if (this.topP && this.topP < 0) {
            throw new Error("`topP` must be a positive integer");
        }
        if (this.topP && this.topP > 1) {
            throw new Error("`topP` must be below 1.");
        }
        this.topK = fields?.topK ?? this.topK;
        if (this.topK && this.topK < 0) {
            throw new Error("`topK` must be a positive integer");
        }
        this.stopSequences = fields?.stopSequences ?? this.stopSequences;
        this.apiKey = fields?.apiKey ?? getEnvironmentVariable("GOOGLE_API_KEY");
        if (!this.apiKey) {
            throw new Error("Please set an API key for Google GenerativeAI " +
                "in the environment variable GOOGLE_API_KEY " +
                "or in the `apiKey` field of the " +
                "ChatGoogleGenerativeAI constructor");
        }
        this.safetySettings = fields?.safetySettings ?? this.safetySettings;
        if (this.safetySettings && this.safetySettings.length > 0) {
            const safetySettingsSet = new Set(this.safetySettings.map((s) => s.category));
            if (safetySettingsSet.size !== this.safetySettings.length) {
                throw new Error("The categories in `safetySettings` array must be unique");
            }
        }
        this.streaming = fields?.streaming ?? this.streaming;
        this.client = new GenerativeAI(this.apiKey).getGenerativeModel({
            model: this.modelName,
            safetySettings: this.safetySettings,
            generationConfig: {
                candidateCount: 1,
                stopSequences: this.stopSequences,
                maxOutputTokens: this.maxOutputTokens,
                temperature: this.temperature,
                topP: this.topP,
                topK: this.topK,
            }
        },
        {
          baseURL: this.baseURL
        });
    }
    _combineLLMOutput() {
        return [];
    }
    _llmType() {
        return "googlegenerativeai";
    }
    async _generate(messages, options, runManager) {
        const prompt = convertBaseMessagesToContent(messages, this._isMultimodalModel);
        // Handle streaming
        if (this.streaming) {
            const tokenUsage = {};
            const stream = this._streamResponseChunks(messages, options, runManager);
            const finalChunks = {};
            for await (const chunk of stream) {
                const index = chunk.generationInfo?.completion ?? 0;
                if (finalChunks[index] === undefined) {
                    finalChunks[index] = chunk;
                }
                else {
                    finalChunks[index] = finalChunks[index].concat(chunk);
                }
            }
            const generations = Object.entries(finalChunks)
                .sort(([aKey], [bKey]) => parseInt(aKey, 10) - parseInt(bKey, 10))
                .map(([_, value]) => value);
            return { generations, llmOutput: { estimatedTokenUsage: tokenUsage } };
        }
        const res = await this.caller.callWithOptions({ signal: options?.signal }, async () => {
            let output;
            try {
                output = await this.client.generateContent({
                    contents: prompt,
                });
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }
            catch (e) {
                // TODO: Improve error handling
                if (e.message?.includes("400 Bad Request")) {
                    e.status = 400;
                }
                throw e;
            }
            return output;
        });
        const generationResult = mapGenerateContentResultToChatResult(res.response);
        await runManager?.handleLLMNewToken(generationResult.generations[0].text ?? "");
        return generationResult;
    }
    async *_streamResponseChunks(messages, options, runManager) {
        const prompt = convertBaseMessagesToContent(messages, this._isMultimodalModel);
        const stream = await this.caller.callWithOptions({ signal: options?.signal }, async () => {
            const { stream } = await this.client.generateContentStream({
                contents: prompt,
            });
            return stream;
        });
        for await (const response of stream) {
            const chunk = convertResponseContentToChatGenerationChunk(response);
            if (!chunk) {
                continue;
            }
            yield chunk;
            await runManager?.handleLLMNewToken(chunk.text ?? "");
        }
    }
}
