import path from "path";
import { readAndParseJson } from '@map3xyz/assets-helper';
import { IndexResult } from "./model/IndexResult";
import { IndexerCommandValidationResult, PlannedTasks } from "./model/types";

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

export async function runIndexerTasks(network?: string, type?: string): Promise<IndexResult[]> {

    try {
        const validation = validateTaskParams(network, type);
        if (validation.errors.length > 0) {
            throw new Error(validation.errors.join('\n'));
        }
    
        const tasks = getPlannedTasks(network, type);
        const results: IndexResult[] = [];
    
        await Promise.all(tasks.map((async network => {
            return new Promise<void>(async resolve => {
                for(const task of network.tasks) {
                    try {
                        const result = await task.run();
                        results.push(result);
                    } catch (err) {
                        console.error(err);
                    }
                }
                resolve();
            });
        })));
    
        return results;
    } catch (err) {
        throw err;
    }
}