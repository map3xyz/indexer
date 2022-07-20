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
            throw `Tokenlist file not found for network ${network} on trustwallet`;
        }

        let tokenlist: TokenList = JSON.parse(fs.readFileSync(tokenlistFile, 'utf8'));

        // @ts-ignore
        tokenlist.tokens = tokenlist.tokens.map(t => {
            const tokenDir = path.join(getTwaInstanceDirectory(), 'blockchains', network, 'assets', t.address);

            if(!fs.existsSync(tokenDir)) {
                return t;
            }
            // expand tokenlist fields with extra available data

            return extractExtraTwaTokenFields(t, path.join(tokenDir, 'info.json'));
        })

        return tokenlist;
    } catch (err) {
        throw err;
    }
}

// TODO; perhaps don't call it within getTokenlist, but perhaps have it return a full enhanced map3 asset object instead of TokenInfo and call it in a post processing one
function extractExtraTwaTokenFields(t: TokenInfo, infoFilePath: string): TokenInfo {
    if(!fs.existsSync(infoFilePath)) {
        throw `Cannot extractExtraTwaTokenFields as can't find info file ${infoFilePath}`;
    }

    const info = JSON.parse(fs.readFileSync(infoFilePath, 'utf-8'));

    if(info.tags && (!t.tags && t.tags.length < info.tags.length)) {
        // @ts-ignore
        t.tags = info.tags;
    }

    if(info.logoURI && t.logoURI) {
        // @ts-ignore
        t.logoURI = info.logoURI;
    }

    return t;
}
