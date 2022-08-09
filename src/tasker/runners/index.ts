import { NetworkTask, NetworkTokenlistTaskResult } from "../model/NetworkTask";
import { fetchTokenlistForNetwork } from "./tokenlists";
import { getTokenlistFromTrustWallet } from "./trustwallet";
import { getChainIdForNetwork, formatAddress } from '@map3xyz/assets-helper';

export async function runTask(task: NetworkTask): Promise<NetworkTokenlistTaskResult> {
    try {
        // TODO: generalise for non tokenlist sources
        let tokenlist;
        switch(task.type) {
            case 'tokenlist':
                tokenlist = await fetchTokenlistForNetwork(task.source, task.network, task.name);
                break;
            case 'trustwallet':
                tokenlist = await getTokenlistFromTrustWallet(task.network);
                break;
            default: 
                throw new Error(`Unknown type: ${task.type}`);
        }

        let chainId;
        try {
            chainId = await getChainIdForNetwork(task.network);
        } catch (err) { }
        

        // attach ChainIds to tokens if they're missing
        // also format addresses properly 
        tokenlist.tokens = tokenlist.tokens.map(t => { 
            if(!t.chainId && chainId) {
                t.chainId = chainId
            }
            t.address = formatAddress(t.address);
            return t;
        });

        return {
            taskType: task.type,
            network: task.network,
            tokenlist: tokenlist
        }
    } catch (err) {
        throw err;
    }
}