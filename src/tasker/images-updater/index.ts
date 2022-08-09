/**
 * Iterates through network assets folders, 
 * Checks that if there are any missing images
 * and download missing images from trustwallet.
 * 
 * TODO:  
 *  - download from tokenlists 
 *  - also set missing colors. 
 *  - if SVG and no PNG, convert to PNG
 */

import path, { resolve } from "path";
import fs from "fs";
import { TRUSTWALLET_CLONED_REPO_LOC, TWA_USER_CONTENT_BASE } from "../../utils/constants";
import { getDirectories, downloadAndPersistLogos, Logos, Asset } from "@map3xyz/assets-helper";

export function needBeUpdateImagesForSubmodule(dir: string, network: string): Promise<boolean> { 
    return new Promise<boolean>(async (resolve, reject) => {

        if(!fs.existsSync(dir)) {
            reject(new Error(`Directory ${dir} does not exist`));
        }

        let hasImprovementsToCommit = false;

        console.log('Checking for missing images for network: ' + network);
        try {
            const assetsDirs = await getDirectories(dir);

            for (const assetDir of assetsDirs) {
                const address = assetDir.split('/')[assetDir.split('/').length - 1];
                if(!address.toLowerCase().startsWith('0x')) {
                    continue;
                }
                const infoJson = JSON.parse(fs.readFileSync(path.join(assetDir, 'info.json'), 'utf8'));
                const asset = new Asset(infoJson);
                
                if(asset.logo?.png || asset.logo?.svg) {
                    continue;
                }
    
                const logoTwaFsPath = path.join(TRUSTWALLET_CLONED_REPO_LOC, 'blockchains', network, 'assets', address,'logo.png');
    
                if(!fs.existsSync(logoTwaFsPath)) {
                    continue;
                }
    
                const logoTwaHttpPath = `${TWA_USER_CONTENT_BASE}/blockchains/${network}/assets/${address}/logo.png`;
               
                try {
                    asset.logo = Logos.getLogosFromUri(logoTwaHttpPath, assetDir);
                    await asset.logo.downloadAndPersistLogos(assetDir);
                    
                    fs.writeFileSync(path.join(assetDir, 'info.json'), asset.deserialise());
                    hasImprovementsToCommit = true;
                } catch (err) { 
                    console.error(`needBeUpdateImagesForSubmodule logoTwaHttpPath download or write error ${err}`)
                }
                
            }
            console.log('Checked for missing images for network: ' + network + 
                (hasImprovementsToCommit ? '. Found some 🙌' : '. No improvements found'));
            resolve(hasImprovementsToCommit);
        } catch (err) {
            reject(err);
        }
    });
}

