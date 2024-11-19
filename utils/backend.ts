import axios from 'axios'

interface ResponseDoneYet {
    model: string,
    created_at: Date,
    response: string,
    done: boolean
}

interface ResponseDone {
    model: string
    created_at: string
    response: string
    done: boolean
    done_reason: string
    context: number[]
    total_duration: number
    load_duration: number
    prompt_eval_count: number
    prompt_eval_duration: number
    eval_count: number
    eval_duration: number
};

export const generate = async (prompt: string) => {
    const URL = 'http://140.125.45.129:11434/api/generate'
    const DATA = { "model": "jcai/llama3-taide-lx-8b-chat-alpha1:Q4_K_M", prompt }

    const response = await axios.post(URL, DATA)
    const ndjson = response.data
    const data = JSON.parse(`[${ndjson.replace(/\r?\n/g, ',').replace(/,\s*$/, '')}]`)

    return data as Array<ResponseDoneYet | ResponseDone>
}