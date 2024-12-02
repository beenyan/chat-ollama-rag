interface SourceNode {
    metadata: {
        headline: string
        author: string
        time: string
    }
    text: string
}

export interface RequestBody {
    source_nodes: Array<SourceNode>
}

export interface ResponseData {
    source_nodes: Array<SourceNodes>,
    response: string
}

export interface SourceNodes extends SourceNode {
    score: number
}

