import path from "path";
import fs from "fs";
import { getDirectories, Asset, Network } from "@map3xyz/assets-helper";
import { SubtaskResult } from "..";

export function syncTcrVerifications(dir: string, network: string): Promise<SubtaskResult> { 
    return new Promise<SubtaskResult>(async (resolve, reject) => {

        if(!fs.existsSync(dir)) {
            reject(new Error(`Directory ${dir} does not exist`));
        }

        let networkDirHasChangesToCommit = false, assetsSubmoduleHasChangesToCommit = false;

        console.log('Attempting to syncTcrVerifications for network: ' + network);
        try {
            // network base asset
            const networkInfoFile = JSON.parse(fs.readFileSync(path.join(dir, 'info.json'), 'utf8'));
            const network = new Network(networkInfoFile);
            const networkVerificationResult = await attemptTcrVerificationForAsset(network);

            if(networkVerificationResult.verified) {
                network.addVerification(networkVerificationResult.verification);
                fs.writeFileSync(path.join(dir, 'info.json'), network.deserialise());
                networkDirHasChangesToCommit = true;
            }
            
            // network map file
            const networkHasMapFile = fs.existsSync(path.join(dir, 'maps.json'));

            if(networkHasMapFile) {
                let maps = Array.from(JSON.parse(fs.readFileSync(path.join(dir, 'maps.json'), 'utf8'))).map(m => new AssetMap(m));
                let hasVerifications = false;
                
                maps = maps.map(async map => {
                    const verificationResult = await attemptTcrVerificationForMap(map);

                    if(verificationResult.verified) {
                        map.addVerification(verificationResult.verification);
                        hasVerifications = true;
                    }
                    return map;
                });

                if(hasVerifications) {
                    fs.writeFileSync(path.join(dir, 'maps.json'), maps.deserialise());
                    networkDirHasChangesToCommit = true;
                }
            }
        
            const assetsDirs = await getDirectories(dir);

            for (const assetDir of assetsDirs) {
                const address = assetDir.split('/')[assetDir.split('/').length - 1];
                if(!address.toLowerCase().startsWith('0x')) {
                    continue;
                }

                let infoJson;

                try {
                    infoJson = JSON.parse(fs.readFileSync(path.join(assetDir, 'info.json'), 'utf8'));
                } catch(err) {
                    console.log(`${assetDir}: does not have an info.json file. Skipping for syncTcrVerifications`);
                    continue;
                }


                // assets verification
                const assetVerificationResult = await attemptTcrVerificationForAsset(network, address);

                if(assetVerificationResult.verified) {
                    const asset = new Asset(infoJson);
                    asset.addVerification(assetVerificationResult.verification);
                    fs.writeFileSync(path.join(assetDir, 'info.json'), asset.deserialise());
                    assetsSubmoduleHasChangesToCommit = true;
                }

                const assetHasMap = fs.existsSync(path.join(assetDir, 'maps.json'));

                if(assetHasMap) {
                    let maps = Array.from(JSON.parse(fs.readFileSync(path.join(assetDir, 'maps.json'), 'utf8'))).map(m => new AssetMap(m));
                    let hasVerifications = false;
                    
                    maps = maps.map(async map => {
                        const verificationResult = await attemptTcrVerificationForMap(map);

                        if(verificationResult.verified) {
                            map.addVerification(verificationResult.verification);
                            hasVerifications = true;
                        }
                        return map;
                    });

                    if(hasVerifications) {
                        fs.writeFileSync(path.join(assetDir, 'maps.json'), maps.deserialise());
                        assetsSubmoduleHasChangesToCommit = true;
                    }
                }

                resolve({
                    networkDirHasChangesToCommit,
                    assetsSubmoduleHasChangesToCommit
                });
            }
        } catch (err) {
            reject(err);
        }
    });
}