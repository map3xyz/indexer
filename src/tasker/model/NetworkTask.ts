import { fetchTokenlistForNetwork } from "../runners/tokenlists";
import { ingestTwaForNetwork } from "../runners/trustwallet";
import { persistJsonFileIntempDir } from '@map3xyz/assets-helper';

export abstract class NetworkTask {
    type: string;
    network: string;
    source: string;
    verified: boolean;

    async run() {
        let tokenlist;
        
        switch(this.type) {
            case 'tokenlist':
                tokenlist = await fetchTokenlistForNetwork(this.source, this.network);
                break;
            case 'trustwallet':
                tokenlist = await ingestTwaForNetwork(this.network);
                break;
            default: 
                throw new Error(`Unknown type: ${this.type}`);
        }
        return persistJsonFileIntempDir(tokenlist, `${this.type}-${this.network}+${new Date().getTime()}`);
    }
}