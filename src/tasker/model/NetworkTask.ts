import { fetchTokenlistForNetwork } from "../runners/tokenlists";
import { getTokenlistFromTrustWallet } from "../runners/trustwallet";
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

    async run(): Promise<NetworkTokenlistTaskResult> {
        try {
            // TODO: generalise for non tokenlist sources
            let tokenlist;
            switch(this.type) {
                case 'tokenlist':
                    tokenlist = await fetchTokenlistForNetwork(this.source, this.network);
                    break;
                case 'trustwallet':
                    tokenlist = await getTokenlistFromTrustWallet(this.network);
                    break;
                default: 
                    throw new Error(`Unknown type: ${this.type}`);
            }

            return {
                taskType: this.type,
                network: this.network,
                tokenlist: tokenlist
            }
        } catch (err) {
            throw err;
        }
    }
}