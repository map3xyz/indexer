import { TokenInfo, TokenList } from '@uniswap/token-lists';
import { cloneOrPullRepoAndUpdateSubmodules } from '@map3xyz/assets-helper';
import { DEFAULT_TEMP_DIR, TRUSTWALLET_REPO } from './../../utils/config';
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

        return JSON.parse(fs.readFileSync(tokenlistFile, 'utf8')) as TokenList;
    } catch (err) {
        throw err;
    }
}