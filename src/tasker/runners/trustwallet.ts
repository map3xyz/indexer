import { TokenInfo, TokenList } from '@uniswap/token-lists';
import { cloneOrPullRepoAndUpdateSubmodules, getDirectories, getChainIdForNetwork } from '@map3xyz/assets-helper';
import { DEFAULT_TEMP_DIR, TRUSTWALLET_REPO, TWA_USER_CONTENT_BASE } from '../../utils/constants';
import path from 'path';
import fs from 'fs';

async function needBeCloneOrRefreshTwaInstance(): Promise<void> {
    const dir = getTwaInstanceDirectory();
    return cloneOrPullRepoAndUpdateSubmodules(TRUSTWALLET_REPO, dir, false);
}

function getTwaInstanceDirectory(fileLoc?: string): string {
    return path.join(DEFAULT_TEMP_DIR, 'trustwallet-assets', fileLoc? fileLoc : "");
}

export async function getTokenlistFromTrustWallet(network: string): Promise<TokenList> {
    
    try {
        await needBeCloneOrRefreshTwaInstance();

        // TODO: handle case where the network that is passed does not have a tokenlist format
        // TODO: handle case where we need to map the network name from map3 to the trustwallet network name (or network dir name).. perhaps use the source config field?
        const tokenlistFile = path.join(getTwaInstanceDirectory(), 'blockchains', network, 'tokenlist.json');

        if(!fs.existsSync(tokenlistFile)) {
            throw new Error(`Tokenlist file not found for network ${network} on trustwallet`);
        }

        const tokenList = JSON.parse(fs.readFileSync(tokenlistFile, 'utf8')) as TokenList;

        const assetDirectory = path.join(getTwaInstanceDirectory(), 'blockchains', network, 'assets');
        const assetDirs = await getDirectories(assetDirectory);
        const chainId = await getChainIdForNetwork(network);

        for (const assetDir of assetDirs) {
            const address = assetDir.split('/')[assetDir.split('/').length - 1];
            if(!address.toLowerCase().startsWith('0x')) {
                continue;
            }
            const info = JSON.parse(fs.readFileSync(path.join(assetDir, 'info.json'), 'utf8'));

            const tokenInTokenlist = tokenList.tokens.find(token => token.address === address);
            const logoHttpPath = `${TWA_USER_CONTENT_BASE}/blockchains/${network}/assets/${address}/logo.png`;

            if(!tokenInTokenlist) {
                tokenList.tokens.push({
                    chainId: chainId,
                    address: address,
                    name: info.name,
                    decimals: info.decimals,
                    symbol: info.symbol,                  
                    logoURI: logoHttpPath,
                    tags: info.tags
                })
            }
        }

        return tokenList;
    } catch (err) {
        throw err;
    }
}