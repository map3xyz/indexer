import axios from 'axios';
import { TokenList } from '@uniswap/token-lists'
import { getChainIdForNetwork } from '@map3xyz/assets-helper';

async function fetchTokenlist(url: string): Promise<TokenList> {
    try {
        return axios.get(url).then(res => res.data as TokenList);
    } catch (err) {
        throw err;
    }
}

export async function fetchTokenlistForNetwork(source: string, network: string, name: string): Promise<TokenList> {
    try {
        const chainId = await getChainIdForNetwork(network);
        // TODO: It's possible that chainId is null for non EVM networks. Need to check
    
        let tokenlist = await fetchTokenlist(source);

        if(Array.isArray(tokenlist)) {
            // it's just a list of tokens in the tokenlist format, so we need to add fluf metadata
            tokenlist = {
                name: name,
                timestamp: new Date().toLocaleDateString(),
                version: { major: 0, minor: 0, patch: 1 },
                tokens: tokenlist
            }
        } 

        // @ts-ignore
        tokenlist.tokens = tokenlist.tokens.filter(token => !token.chainId || token.chainId === chainId);

        return tokenlist;
    } catch (err) {
        throw err;
    }
}