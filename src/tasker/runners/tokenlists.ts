import axios from 'axios';
import { TokenList } from '@uniswap/token-lists'
import { getChainIdForNetwork } from '../../utils/networks';

async function fetchTokenlist(url: string): Promise<TokenList> {
    try {
        return axios.get(url).then(res => res.data as TokenList);
    } catch (err) {
        throw err;
    }
}

export async function ingestTokenlistForNetwork(source: string, network: string): Promise<TokenList> {
    const chainId = getChainIdForNetwork(network);
    let tokenlist = await fetchTokenlist(source);
    // @ts-ignore
    tokenlist.tokens = tokenlist.tokens.filter(token => token.chainId === chainId);

    return tokenlist;
}