import { persistTokenlistInTempDir } from "../../utils/filesystem";
import { ingestTokenlistForNetwork } from "../runners/tokenlists";
import { ingestTwaForNetwork } from "../runners/trustwallet";

export abstract class NetworkTask {
    type: string;
    network: string;
    source: string;
    verified: boolean;

    async run() {
        let tokenlist;
        
        switch(this.type) {
            case 'tokenlist':
                tokenlist = await ingestTokenlistForNetwork(this.source, this.network);
                break;
            case 'trustwallet':
                tokenlist = await ingestTwaForNetwork(this.network);
                break;
            default: 
                throw new Error(`Unknown type: ${this.type}`);
        }
        return persistTokenlistInTempDir(tokenlist, `${this.type}-${this.network}+${new Date().getTime()}`);
    }
}