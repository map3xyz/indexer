import { TokenList } from "@uniswap/token-lists";

export interface NetworkTokenlistTaskResult {
    network: string;
    taskType: string;
    tokenlist: TokenList;
}
export abstract class NetworkTask {
    name: string;
    type: string;
    network: string;
    source: string;
    verified: boolean;
}