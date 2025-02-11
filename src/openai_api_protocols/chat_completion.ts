/**
 * The input to OpenAI API, directly adopted from openai-node with small tweaks:
 * https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * 
 * Copyright 2024 OpenAI
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *      http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

/* eslint-disable @typescript-eslint/no-namespace */

//////////////////////////////// 0. HIGH-LEVEL INTERFACES ////////////////////////////////

/**
 * OpenAI chat completion request protocol.
 * 
 * API reference: https://platform.openai.com/docs/api-reference/chat/create
 * Followed: https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
 * 
 * @note `model` is excluded. call `ChatModule.reload(model)` explicitly before calling this API.
 */
export interface ChatCompletionRequestBase {
    /**
     * A list of messages comprising the conversation so far.
     */
    messages: Array<ChatCompletionMessageParam>;

    /**
     * If set, partial message deltas will be sent.
     */
    stream?: boolean | null;

    /**
     * How many chat completion choices to generate for each input message.
     * 
     */
    n?: number | null;

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on their
     * existing frequency in the text so far, decreasing the model's likelihood to
     * repeat the same line verbatim.
     *
     * [See more information about frequency and presence penalties.](https://platform.openai.com/docs/guides/text-generation/parameter-details)
     */
    frequency_penalty?: number | null;

    /**
     * Number between -2.0 and 2.0. Positive values penalize new tokens based on
     * whether they appear in the text so far, increasing the model's likelihood to
     * talk about new topics.
     *
     * [See more information about frequency and presence penalties.](https://platform.openai.com/docs/guides/text-generation/parameter-details)
     */
    presence_penalty?: number | null;

    /**
     * The maximum number of [tokens](/tokenizer) that can be generated in the chat
     * completion.
     *
     * The total length of input tokens and generated tokens is limited by the model's
     * context length, **determined during MLC's compilation phase**.
     */
    max_gen_len?: number | null;

    /**
     * Sequences where the API will stop generating further tokens.
     */
    stop?: string | null | Array<string>;

    /**
     * What sampling temperature to use, between 0 and 2. Higher values like 0.8 will
     * make the output more random, while lower values like 0.2 will make it more
     * focused and deterministic.
     */
    temperature?: number | null;

    /**
     * An alternative to sampling with temperature, called nucleus sampling, where the
     * model considers the results of the tokens with top_p probability mass. So 0.1
     * means only the tokens comprising the top 10% probability mass are considered.
     */
    top_p?: number | null;

    //////////////// BELOW FIELDS NOT SUPPORTED YET ////////////////

    /**
     * Model to carry out this API.
     * 
     * @note Not supported. Instead call `ChatModule.reload(model)` before calling this API.
     */
    model?: string | null;

    /**
     *
     * Modify the likelihood of specified tokens appearing in the completion.
     * 
     * @note Not supported, see `webllm.LogitProcessor` instead.
     */
    logit_bias?: Record<string, number> | null;

    /**
     * Whether to return log probabilities of the output tokens or not.
     * 
     * If true, returns the log probabilities of each output token returned in the `content` of
     * `message`.
     * 
     * @note Not supported yet.
     */
    logprobs?: boolean | null;

    /**
     * An integer between 0 and 5 specifying the number of most likely tokens to return
     * at each token position, each with an associated log probability. `logprobs` must
     * be set to `true` if this parameter is used.
     * 
     * @note Not supported yet
     */
    top_logprobs?: number | null;

    /**
     * If specified, our system will make a best effort to sample deterministically, such that
     * repeated requests with the same `seed` and parameters should return the same result.
     * 
     * @note Not supported yet.
     */
    seed?: number | null;

    /**
     * Controls which (if any) function is called by the model. `none` means the model
     * will not call a function and instead generates a message. `auto` means the model
     * can pick between generating a message or calling a function. Specifying a
     * particular function via
     * `{"type": "function", "function": {"name": "my_function"}}` forces the model to
     * call that function.
     *
     * `none` is the default when no functions are present. `auto` is the default if
     * functions are present.
     * 
     * @note Not supported yet
     */
    tool_choice?: ChatCompletionToolChoiceOption;

    /**
     * A list of tools the model may call. Currently, only functions are supported as a
     * tool. Use this to provide a list of functions the model may generate JSON inputs
     * for.
     * 
     * @note Not supported yet
     */
    tools?: Array<ChatCompletionTool>;

    /**
     * An object specifying the format that the model must output.
     *
     * Setting to `{ "type": "json_object" }` enables JSON mode, which guarantees the
     * message the model generates is valid JSON.
     *
     * **Important:** when using JSON mode, you **must** also instruct the model to
     * produce JSON yourself via a system or user message. Without this, the model may
     * generate an unending stream of whitespace until the generation reaches the token
     * limit, resulting in a long-running and seemingly "stuck" request. Also note that
     * the message content may be partially cut off if `finish_reason="length"`, which
     * indicates the generation exceeded `max_gen_len` or the conversation exceeded the
     * max context length.
     * 
     * @note **json_object not supported yet.**
     */
    response_format?: ResponseFormat;
}

export interface ChatCompletionRequestNonStreaming extends ChatCompletionRequestBase {
    /**
     * If set, partial message deltas will be sent.
     */
    stream?: false | null;
}

export interface ChatCompletionRequestStreaming extends ChatCompletionRequestBase {
    /**
     * If set, partial message deltas will be sent.
     */
    stream: true;
}

export type ChatCompletionRequest = ChatCompletionRequestNonStreaming | ChatCompletionRequestStreaming;

/**
 * Represents a chat completion response returned by model, based on the provided input.
 */
export interface ChatCompletion {
    /**
     * A unique identifier for the chat completion.
     */
    id: string;

    /**
     * A list of chat completion choices. Can be more than one if `n` is greater than 1.
     */
    choices: Array<ChatCompletion.Choice>;

    /**
     * The model used for the chat completion.
     */
    model: string;

    /**
     * The object type, which is always `chat.completion`.
     */
    object: 'chat.completion';

    /**
     * The Unix timestamp (in seconds) of when the chat completion was created.
     * 
     */
    created: number;

    /**
     * This fingerprint represents the backend configuration that the model runs with.
     *
     * Can be used in conjunction with the `seed` request parameter to understand when
     * backend changes have been made that might impact determinism.
     * 
     * @note Not supported yet.
     */
    system_fingerprint?: string;

    /**
     * Usage statistics for the completion request.
     * 
     * @note Not supported yet.
     */
    usage?: CompletionUsage;
}

/**
 * Represents a streamed chunk of a chat completion response returned by model,
 * based on the provided input.
 */
export interface ChatCompletionChunk {
    /**
     * A unique identifier for the chat completion. Each chunk has the same ID.
     */
    id: string;

    /**
     * A list of chat completion choices. Can be more than one if `n` is greater
     * than 1.
     */
    choices: Array<ChatCompletionChunk.Choice>;

    /**
     * The Unix timestamp (in seconds) of when the chat completion was created. Each
     * chunk has the same timestamp.
     */
    created: number;

    /**
     * The model to generate the completion.
     */
    model: string;

    /**
     * The object type, which is always `chat.completion.chunk`.
     */
    object: 'chat.completion.chunk';

    /**
     * This fingerprint represents the backend configuration that the model runs with.
     * Can be used in conjunction with the `seed` request parameter to understand when
     * backend changes have been made that might impact determinism.
     * 
     * @note Not supported yet.
     */
    system_fingerprint?: string;
}

export const ChatCompletionRequestUnsupportedFields: Array<string> = [
    "model",
    "logit_bias",
    "logprobs",
    "tool_choice",
    "tools",
    "response_format",
    "seed",
    "top_logprobs"
];

export function postInitAndCheckFields(request: ChatCompletionRequest): void {
    // 1. Check unsupported fields in request
    const unsupported: Array<string> = [];
    ChatCompletionRequestUnsupportedFields.forEach((field) => {
        if (field in request) {
            unsupported.push(field);
        }
    });
    if (unsupported.length > 0) {
        throw new Error(
            "The following fields in ChatCompletionRequest are not yet supported: \n" + unsupported
        );
    }

    // 2. Check unsupported messages
    request.messages.forEach((message: ChatCompletionMessageParam, index: number) => {
        if (message.role === "user" && typeof message.content !== "string") {
            // ChatCompletionUserMessageParam
            // Remove this when we support image input
            throw new Error(
                "User message only supports string `content` for now, but received: " +
                message.content
            );
        }
        if (message.role === "assistant" && message.tool_calls !== undefined) {
            // ChatCompletionAssistantMessageParam
            // Remove this when we support image input
            throw new Error("`tool_calls` is not supported yet.");
        }
        if (message.role === "tool") {
            // ChatCompletionToolMessageParam
            throw new Error("`tool` and `function` are not supported yet.");
        }
        if (message.role === "system" && index !== 0) {
            throw new Error("System prompt should always be the first one in `messages`.");
        }
    })

    // 3. Last message has to be from user
    const lastId = request.messages.length - 1;
    if (request.messages[lastId].role !== "user") {
        throw new Error("Last message should be from `user`.");
    }

    // 4. If streaming, n cannot be > 1, since we cannot manage multiple sequences at once
    if (request.stream && request.n && request.n > 1) {
        throw new Error("When streaming, `n` cannot be > 1.")
    }
}

//////////////// BELOW ARE INTERFACES THAT SUPPORT THE ONES ABOVE ////////////////

//////////////////////////////// 1. MESSAGES ////////////////////////////////

//////////////////////////////// 1.1. CHAT COMPLETION CONTENT ////////////////////////////////

export type ChatCompletionContentPart = ChatCompletionContentPartText | ChatCompletionContentPartImage;

export interface ChatCompletionContentPartText {
    /**
     * The text content.
     */
    text: string;

    /**
     * The type of the content part.
     */
    type: 'text';
}

export namespace ChatCompletionContentPartImage {
    export interface ImageURL {
        /**
         * Either a URL of the image or the base64 encoded image data.
         */
        url: string;

        /**
         * Specifies the detail level of the image.
         */
        detail?: 'auto' | 'low' | 'high';
    }
}

export interface ChatCompletionContentPartImage {

    image_url: ChatCompletionContentPartImage.ImageURL;
    /**
     * The type of the content part.
     */
    type: 'image_url';
}

//////////////////////////////// 1.2. MESSAGE TOOL CALL ////////////////////////////////

export interface ChatCompletionMessageToolCall {
    /**
     * The ID of the tool call.
     */
    id: string;

    /**
     * The function that the model called.
     */
    function: ChatCompletionMessageToolCall.Function;

    /**
     * The type of the tool. Currently, only `function` is supported.
     */
    type: 'function';
}

export namespace ChatCompletionMessageToolCall {
    /**
     * The function that the model called.
     */
    export interface Function {
        /**
         * The arguments to call the function with, as generated by the model in JSON
         * format. Note that the model does not always generate valid JSON, and may
         * hallucinate parameters not defined by your function schema. Validate the
         * arguments in your code before calling your function.
         */
        arguments: string;

        /**
         * The name of the function to call.
         */
        name: string;
    }
}

//////////////////////////////// 1.3. MESSAGE PARAM ////////////////////////////////

/**
 * The role of the author of a message
 */
export type ChatCompletionRole = 'system' | 'user' | 'assistant' | 'tool' | 'function';

export interface ChatCompletionSystemMessageParam {
    /**
     * The contents of the system message.
     */
    content: string;

    /**
     * The role of the messages author, in this case `system`.
     */
    role: 'system';
}

export interface ChatCompletionUserMessageParam {
    /**
     * The contents of the user message.
     */
    content: string | Array<ChatCompletionContentPart>;

    /**
     * The role of the messages author, in this case `user`.
     */
    role: 'user';

    /**
     * An optional name for the participant. Provides the model information to
     * differentiate between participants of the same role.
     * 
     * @note This is experimental, as models typically have predefined names for the user.
     */
    name?: string;
}

export interface ChatCompletionAssistantMessageParam {
    /**
     * The role of the messages author, in this case `assistant`.
     */
    role: 'assistant';

    /**
     * The contents of the assistant message. Required unless `tool_calls` is specified.
     */
    content?: string | null;

    /**
     * An optional name for the participant. Provides the model information to
     * differentiate between participants of the same role.
     * 
     * @note This is experimental, as models typically have predefined names for the user.
     */
    name?: string;

    /**
     * The tool calls generated by the model, such as function calls.
     */
    tool_calls?: Array<ChatCompletionMessageToolCall>;
}

export interface ChatCompletionToolMessageParam {
    /**
     * The contents of the tool message.
     */
    content: string;

    /**
     * The role of the messages author, in this case `tool`.
     */
    role: 'tool';

    /**
     * Tool call that this message is responding to.
     */
    tool_call_id: string;
}

export type ChatCompletionMessageParam =
    | ChatCompletionSystemMessageParam
    | ChatCompletionUserMessageParam
    | ChatCompletionAssistantMessageParam
    | ChatCompletionToolMessageParam;


//////////////////////////////// 2. TOOL USING ////////////////////////////////

/**
 * The parameters the functions accepts, described as a JSON Schema object. See the
 * [guide](https://platform.openai.com/docs/guides/text-generation/function-calling)
 * for examples, and the
 * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
 * documentation about the format.
 *
 * Omitting `parameters` defines a function with an empty parameter list.
 */
export type FunctionParameters = Record<string, unknown>;

export interface FunctionDefinition {
    /**
     * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain
     * underscores and dashes, with a maximum length of 64.
     */
    name: string;

    /**
     * A description of what the function does, used by the model to choose when and
     * how to call the function.
     */
    description?: string;

    /**
     * The parameters the functions accepts, described as a JSON Schema object. See the
     * [guide](https://platform.openai.com/docs/guides/text-generation/function-calling)
     * for examples, and the
     * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
     * documentation about the format.
     *
     * Omitting `parameters` defines a function with an empty parameter list.
     */
    parameters?: FunctionParameters;
}

export interface ChatCompletionTool {
    function: FunctionDefinition;

    /**
     * The type of the tool. Currently, only `function` is supported.
     */
    type: 'function';
}

/**
* Specifies a tool the model should use. Use to force the model to call a specific
* function.
*/
export interface ChatCompletionNamedToolChoice {
    function: ChatCompletionNamedToolChoice.Function;

    /**
     * The type of the tool. Currently, only `function` is supported.
     */
    type: 'function';
}

export namespace ChatCompletionNamedToolChoice {
    export interface Function {
        /**
         * The name of the function to call.
         */
        name: string;
    }
}

/**
 * Controls which (if any) function is called by the model. `none` means the model
 * will not call a function and instead generates a message. `auto` means the model
 * can pick between generating a message or calling a function. Specifying a
 * particular function via
 * `{"type": "function", "function": {"name": "my_function"}}` forces the model to
 * call that function.
 *
 * `none` is the default when no functions are present. `auto` is the default if
 * functions are present.
 */
export type ChatCompletionToolChoiceOption = 'none' | 'auto' | ChatCompletionNamedToolChoice;

//////////////////////////////// 3. OTHERS ////////////////////////////////

//////////////////////////////// 3.1. LOG PROBS (NOT SUPPORTED YET) ////////////////////////////////
export interface TopLogprob {
    /**
     * The token.
     */
    token: string;

    /**
     * A list of integers representing the UTF-8 bytes representation of the token.
     * Useful in instances where characters are represented by multiple tokens and
     * their byte representations must be combined to generate the correct text
     * representation. Can be `null` if there is no bytes representation for the token.
     */
    bytes: Array<number> | null;

    /**
     * The log probability of this token.
     */
    logprob: number;
}

export interface ChatCompletionTokenLogprob {
    /**
     * The token.
     */
    token: string;

    /**
     * A list of integers representing the UTF-8 bytes representation of the token.
     * Useful in instances where characters are represented by multiple tokens and
     * their byte representations must be combined to generate the correct text
     * representation. Can be `null` if there is no bytes representation for the token.
     */
    bytes: Array<number> | null;

    /**
     * The log probability of this token.
     */
    logprob: number;

    /**
     * List of the most likely tokens and their log probability, at this token
     * position. In rare cases, there may be fewer than the number of requested
     * `top_logprobs` returned.
     */
    top_logprobs: Array<TopLogprob>;
}

//////////////////////////////// 3.2. OTHERS ////////////////////////////////
/**
 * A chat completion message generated by the model.
 */
export interface ChatCompletionMessage {
    /**
     * The contents of the message.
     */
    content: string | null;

    /**
     * The role of the author of this message.
     */
    role: 'assistant';

    /**
     * The tool calls generated by the model, such as function calls.
     */
    tool_calls?: Array<ChatCompletionMessageToolCall>;
}

/**
 * Usage statistics for the completion request.
 */
export interface CompletionUsage {
    /**
     * Number of tokens in the generated completion.
     */
    completion_tokens: number;

    /**
     * Number of tokens in the prompt.
     */
    prompt_tokens: number;

    /**
     * Total number of tokens used in the request (prompt + completion).
     */
    total_tokens: number;
}

/**
 * The reason the model stopped generating tokens. This will be `stop` if the model
 * hit a natural stop point or a provided stop sequence, `length` if the maximum
 * number of tokens specified in the request was reached, `tool_calls` if the
 * model called a tool, or `abort` if user manually stops the generation.
 */
export type ChatCompletionFinishReason = 'stop' | 'length' | 'tool_calls' | 'abort';

export namespace ChatCompletion {
    export interface Choice {
        /**
         * The reason the model stopped generating tokens. This will be `stop` if the model
         * hit a natural stop point or a provided stop sequence, `length` if the maximum
         * number of tokens specified in the request was reached, `tool_calls` if the
         * model called a tool, or `abort` if user manually stops the generation.
         */
        finish_reason: ChatCompletionFinishReason;

        /**
         * The index of the choice in the list of choices.
         */
        index: number;

        /**
         * Log probability information for the choice.
         * 
         * @note Not supported yet.
         */
        logprobs: Choice.Logprobs | null;

        /**
         * A chat completion message generated by the model.
         */
        message: ChatCompletionMessage;
    }

    export namespace Choice {
        /**
         * Log probability information for the choice.
         */
        export interface Logprobs {
            /**
             * A list of message content tokens with log probability information.
             */
            content: Array<ChatCompletionTokenLogprob> | null;
        }
    }
}

export namespace ChatCompletionChunk {
    export interface Choice {
        /**
         * A chat completion delta generated by streamed model responses.
         */
        delta: Choice.Delta;

        /**
         * The reason the model stopped generating tokens. This will be `stop` if the model
         * hit a natural stop point or a provided stop sequence, `length` if the maximum
         * number of tokens specified in the request was reached, `tool_calls` if the
         * model called a tool, or `abort` if user manually stops the generation.
         */
        finish_reason: ChatCompletionFinishReason | null;

        /**
         * The index of the choice in the list of choices.
         */
        index: number;

        /**
         * Log probability information for the choice.
         */
        logprobs?: Choice.Logprobs | null;
    }

    export namespace Choice {
        /**
         * A chat completion delta generated by streamed model responses.
         */
        export interface Delta {
            /**
             * The contents of the chunk message.
             */
            content?: string | null;

            /**
             * The role of the author of this message.
             */
            role?: 'system' | 'user' | 'assistant' | 'tool';

            tool_calls?: Array<Delta.ToolCall>;
        }

        export namespace Delta {
            export interface ToolCall {
                index: number;

                /**
                 * The ID of the tool call.
                 */
                id?: string;

                function?: ToolCall.Function;

                /**
                 * The type of the tool. Currently, only `function` is supported.
                 */
                type?: 'function';
            }

            export namespace ToolCall {
                export interface Function {
                    /**
                     * The arguments to call the function with, as generated by the model in JSON
                     * format. Note that the model does not always generate valid JSON, and may
                     * hallucinate parameters not defined by your function schema. Validate the
                     * arguments in your code before calling your function.
                     */
                    arguments?: string;

                    /**
                     * The name of the function to call.
                     */
                    name?: string;
                }
            }
        }

        /**
         * Log probability information for the choice.
         */
        export interface Logprobs {
            /**
             * A list of message content tokens with log probability information.
             */
            content: Array<ChatCompletionTokenLogprob> | null;
        }
    }
}

/**
 * An object specifying the format that the model must output.
 *
 * Setting to `{ "type": "json_object" }` enables JSON mode, which guarantees the
 * message the model generates is valid JSON.
 *
 * **Important:** when using JSON mode, you **must** also instruct the model to
 * produce JSON yourself via a system or user message. Without this, the model may
 * generate an unending stream of whitespace until the generation reaches the token
 * limit, resulting in a long-running and seemingly "stuck" request. Also note that
 * the message content may be partially cut off if `finish_reason="length"`, which
 * indicates the generation exceeded `max_gen_len` or the conversation exceeded the
 * max context length.
 * 
 * @note **json_object not supported yet.**
 */
export interface ResponseFormat {
    /**
     * Must be one of `text` or `json_object`.
     */
    type?: 'text' | 'json_object';
}
