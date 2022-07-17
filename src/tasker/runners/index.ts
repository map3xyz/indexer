import { NetworkTask, NetworkTokenlistTaskResult } from "../model/NetworkTask";
import { fetchTokenlistForNetwork } from "./tokenlists";
import { getTokenlistFromTrustWallet } from "./trustwallet";

export async function runTask(task: NetworkTask): Promise<NetworkTokenlistTaskResult> {
    try {
        // TODO: generalise for non tokenlist sources
        let tokenlist;
        switch(task.type) {
            case 'tokenlist':
                tokenlist = await fetchTokenlistForNetwork(task.source, task.network);
                break;
            case 'trustwallet':
                tokenlist = await getTokenlistFromTrustWallet(task.network);
                break;
            default: 
                throw new Error(`Unknown type: ${task.type}`);
        }

        return {
            taskType: task.type,
            network: task.network,
            tokenlist: tokenlist
        }
    } catch (err) {
        throw err;
    }
}