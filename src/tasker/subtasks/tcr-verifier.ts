import path from "path";
import fs from "fs";
import { getDirectories, Asset, Network, attemptTcrVerificationForAsset } from "@map3xyz/assets-helper";
import { SubtaskResult } from "..";

export function syncTcrVerifications(networkDir: string, network: string): Promise<SubtaskResult> { 
    return new Promise<SubtaskResult>(async (resolve, reject) => {

        if(!fs.existsSync(networkDir)) {
            reject(new Error(`Directory ${networkDir} does not exist`));
        }

        let networkDirHasChangesToCommit = false, assetsSubmoduleHasChangesToCommit = false;

        try {
            // network base asset
            const networkInfoFile = JSON.parse(fs.readFileSync(path.join(networkDir, 'info.json'), 'utf8'));
            const network = new Network(networkInfoFile);

            if(network.networkCode !== 'ethereum') {
                return {
                    networkDirHasChangesToCommit,
                    assetsSubmoduleHasChangesToCommit
                }
            }
            console.log('Attempting to syncTcrVerifications for network: ' + network.networkCode);
            const networkVerificationResult = await attemptTcrVerificationForAsset(network.networkCode);

            if(networkVerificationResult.verified) {
                networkVerificationResult.verifications.forEach(v => network.addVerification(v));
                fs.writeFileSync(path.join(networkDir, 'info.json'), network.deserialise());
                networkDirHasChangesToCommit = true;
            }
            
            // network map file
            const networkHasMapFile = fs.existsSync(path.join(networkDir, 'maps.json'));

            // if(networkHasMapFile) {
            //     let maps = Array.from(JSON.parse(fs.readFileSync(path.join(dir, 'maps.json'), 'utf8'))).map(m => new AssetMap(m));
            //     let hasVerifications = false;
                
            //     maps = maps.map(async map => {
            //         const verificationResult = await attemptTcrVerificationForMap(map);

            //         if(verificationResult.verified) {
            //             map.addVerification(verificationResult.verification);
            //             hasVerifications = true;
            //         }
            //         return map;
            //     });

            //     if(hasVerifications) {
            //         fs.writeFileSync(path.join(dir, 'maps.json'), maps.deserialise());
            //         networkDirHasChangesToCommit = true;
            //     }
            // }
        
            const assetDir = path.join(networkDir, 'assets', `${network.networkCode}-tokenlist`);

            let TMP_COUNTER = 0; 

            if(fs.existsSync(assetDir)) {
                const assetsDirs = await getDirectories(assetDir);

                for (const assetDir of assetsDirs) {
                    if(TMP_COUNTER > 1) {
                        break;
                    }
                    
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
                    const assetVerificationResult = await attemptTcrVerificationForAsset(network.networkCode, address);

                    if(assetVerificationResult.verified) {
                        const asset = new Asset(infoJson);
                        assetVerificationResult.verifications.forEach(v => asset.addVerification(v));
                        fs.writeFileSync(path.join(assetDir, 'info.json'), asset.deserialise());
                        assetsSubmoduleHasChangesToCommit = true;
                    }

                    const assetHasMap = fs.existsSync(path.join(assetDir, 'maps.json'));

                    // if(assetHasMap) {
                    //     let maps = Array.from(JSON.parse(fs.readFileSync(path.join(assetDir, 'maps.json'), 'utf8'))).map(m => new AssetMap(m));
                    //     let hasVerifications = false;
                        
                    //     maps = maps.map(async map => {
                    //         const verificationResult = await attemptTcrVerificationForMap(map);

                    //         if(verificationResult.verified) {
                                // verificationResult.verifications.forEach(v => map.addVerification(v));
                    //             hasVerifications = true;
                    //         }
                    //         return map;
                    //     });

                    //     if(hasVerifications) {
                    //         fs.writeFileSync(path.join(assetDir, 'maps.json'), maps.deserialise());
                    //         assetsSubmoduleHasChangesToCommit = true;
                    //     }
                    // }
                    TMP_COUNTER++;
                }
            }
            resolve({
                networkDirHasChangesToCommit,
                assetsSubmoduleHasChangesToCommit
            });
        } catch (err) {
            reject(err);
        }
    });
}