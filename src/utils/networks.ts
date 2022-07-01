

import { getNetworks, NetworkInfo } from '@map3xyz/assets-helper';
let chainIdMap; 

async function getChainIdMap() {
    if (chainIdMap && Object.keys(chainIdMap).length > 0) {
        return chainIdMap;
    }

    const networkInfoFiles: NetworkInfo[] = await getNetworks();
    chainIdMap = {};
    for (const [name, identifiers] of networkInfoFiles) {
        chainIdMap[name] = identifiers.chainId;
    }

    return chainIdMap;
}
export async function getChainIdForNetwork(network: string): Promise<number> {
    if(!chainIdMap) {
        chainIdMap = await getChainIdMap();
    }

    return chainIdMap[network];
}