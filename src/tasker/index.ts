import path from "path";
import { readAndParseJson, getRandomBranchNameForNetwork, persistJsonFile, push, ingestTokenList, cloneOrPullRepoAndUpdateSubmodules} from '@map3xyz/assets-helper';
import { IndexResult } from "./model/IndexResult";
import { IndexerCommandValidationResult, PlannedTasks } from "./model/types";
import { NetworkTokenlistTaskResult } from "./model/NetworkTask";
import fs from 'fs';
import { TRUSTWALLET_CLONED_REPO_LOC, TRUSTWALLET_REPO } from "../utils/config";

function validateTaskParams(network: string, type: string): IndexerCommandValidationResult {
    const tasks = readAndParseJson(path.join(__dirname, '../../', 'tasks.json'));

    const networks = Array.from(new Set(tasks.map(t => t.network)));
    const types = Array.from(new Set(tasks.map(t => t.type)));

    let valid = true;
    const errors = [];

    if (network && !networks.includes(network)) {
        valid = false;
        errors.push(`🚨 Network ${network} is not supported. Supported networks are: ${networks.join(', ')}`);
    }
    
    if (type && !types.includes(type)) {
        valid = false;
        errors.push(`🚨 Type ${type} is not supported. Supported types are: ${types.join(', ')}`);
    }

    return { valid, errors };
}


function getPlannedTasks(network?: string, type?: string): PlannedTasks[] {
    try {
        let tasks = readAndParseJson(path.join(__dirname, '../../', 'tasks.json'));

        if(network) {
            tasks = tasks.filter(t => t.network === network);
        } 

        if(type) {
            tasks.filter(t => t.type === type);
        }
        
        const networks = Array.from(new Set(tasks.map(t => t.network))) as string[];
        const plannedTasks: PlannedTasks[] = [];

        for(const _network of networks) {
            const networkTasks = tasks.filter(t => t.network === _network);
            plannedTasks.push({ 
                network: _network, 
                tasks: networkTasks 
            });
        }
    
        return plannedTasks;
    } catch (err) {
        throw err;
    }
}

async function ensureAssetsRepoClonedAndInLatestMaster() : Promise<void> {
    // ensure that the assets repo is cloned and up to date
    return cloneOrPullRepoAndUpdateSubmodules(TRUSTWALLET_REPO, TRUSTWALLET_CLONED_REPO_LOC, true, 'master')
}

function getRepoDirForNetworkToken(network: string, address: string): string {
    // TODO: generalise for more than one submodule (i.e. tokenlist-ext-1)
    return path.join(getRepoDirForNetwork(network), 'tokens', `${network}-tokenlist`, address);
    
}

function getRepoDirForNetwork(network: string): string {
    return path.join('networks', network);
}

export async function runIndexerTasks(network?: string, type?: string): Promise<IndexResult[]> {

    try {
        const validation = validateTaskParams(network, type);
        if (validation.errors.length > 0) {
            throw new Error('Error(s) running indexer tasks: \n' + validation.errors.join('\n'));
        }

        await ensureAssetsRepoClonedAndInLatestMaster();
    
        const networkTasks = getPlannedTasks(network, type);
        const results: IndexResult[] = [];
        const networkTaskResults: NetworkTokenlistTaskResult[] = [];
        let foundNewAssets = false;
    
        await Promise.all(networkTasks.map((network => {
            return new Promise<void>(async resolve => {
                for(const task of network.tasks) {
                    try {
                        let result = await task.run();

                        if(result.tokenlist && result.tokenlist.tokens.length > 0) {
                            result.tokenlist.tokens.forEach(token => {
                                            
                                // For each network tokenlist, extract the new ones to add                                                
                                const tokenExistsInRepo = fs.existsSync(getRepoDirForNetworkToken(task.network, token.address));
                                const tokenExistsInTempResults = networkTaskResults.find(_result => result.tokenlist.tokens.find(t => t.address === token.address));
                                
                                if(!tokenExistsInRepo && !tokenExistsInTempResults) {
                                    foundNewAssets = true;
                                    result.tokenlist = {
                                        ...result.tokenlist,
                                        tokens: result.tokenlist.tokens.filter(t => t.address !== token.address)
                                    };
                                }
                            });
                        }

                        networkTaskResults.push(result);

                    } catch (err) {
                        // ignore and just log
                        console.error(`Error performing ${task.type} task ${task.source} on nework ${task.network}`, err);
                        results.push({
                            success: false,
                            network: task.network,
                            type: task.type,
                            source: task.source,
                            verified: task.verified,
                            newTokensIndexed: 0,
                            errors: [err.message]
                        })
                    }
                }
            
                // if there are new ones to add and new branch has not been created (foundnewassets=false), create a new branch
                if(foundNewAssets) {
                    const newBranchName = getRandomBranchNameForNetwork(network.network);
                    for (const result of networkTaskResults) {
                        const file = persistJsonFile(result.tokenlist);
                        // Ingest the new ones and their props/files/logos to disk. Transform to map3 tokenlist format
                        // commit with a nice commit message that allows us to parse what's been done programmatically
                        await ingestTokenList(file, getRepoDirForNetwork(network.network), newBranchName)
                    }
                    
                    // TODO: validate repo is clean 

                    // push new branch
                    await push(TRUSTWALLET_CLONED_REPO_LOC, newBranchName);

                    // TODO: open pull request
                }

                resolve();
            });
            // TODO: delay/wait 30s, revert to master, pull lastest and terminate (to allow for remote validation and auto merging)
        })));
    
        return results;
    } catch (err) {
        throw err;
    }
}



