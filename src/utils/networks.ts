

let chainIdMap; 

async function getChainIdMap() {
    if (chainIdMap) {
        return chainIdMap;
    }

    const networkInfoFiles = [];
    // TODO await getNetworks(); from assets-helper returning a NetworkInfo[]
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