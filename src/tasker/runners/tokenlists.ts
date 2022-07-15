import axios from 'axios';
import { TokenList } from '@uniswap/token-lists'
import { getChainIdForNetwork, getNetworkByName } from '../../utils/networks';

async function fetchTokenlist(url: string): Promise<TokenList> {
    try {
        return axios.get(url).then(res => res.data as TokenList);
    } catch (err) {
        throw err;
    }
}

export async function fetchTokenlistForNetwork(source: string, network: string): Promise<TokenList> {
    try {
        const chainId = await getChainIdForNetwork(network);
        // TODO: It's possible that chainId is null for non EVM networks. Need to check
    
        let tokenlist = await fetchTokenlist(source);
        // @ts-ignore
        tokenlist.tokens = tokenlist.tokens.filter(token => token.chainId === chainId);

        return tokenlist;
    } catch (err) {
        throw err;
    }
}