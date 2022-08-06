

import { getNetworks, NetworkInfo } from '@map3xyz/assets-helper';
let networks: NetworkInfo[];

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