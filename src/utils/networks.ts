

import { getNetworks, NetworkInfo } from '@map3xyz/assets-helper';
let chainIdMap;
let networks: NetworkInfo[];

async function getChainIdMap() {
    try {
        if (chainIdMap && Object.keys(chainIdMap).length > 0) {
            return chainIdMap;
        }
    
        networks = await getNetworks();
        chainIdMap = {};
        networks.forEach(network => {
            chainIdMap[network.name] = network.identifiers.chainId;
        });
        
        return chainIdMap;
    } catch (err) {
        throw err;
    }
}
export async function getChainIdForNetwork(network: string): Promise<number> {
    try {
        if(!chainIdMap) {
            chainIdMap = await getChainIdMap();
        }
    
        return chainIdMap[network];
    } catch (err) {
        throw err;
    }
}

export async function getNetworkByName(network: string): Promise<NetworkInfo> {
    try {
        if(!networks) {
            networks = await getNetworks();
        }
    
        return networks.find(n => n.name === network);
    } catch (err) {
        throw err;
    }
}