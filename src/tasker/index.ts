import path from "path";
import { readAndParseJson } from "../utils/filesystem";
import { IndexResult } from "./model/IndexResult";
import { NetworkTask } from "./model/NetworkTask";
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


function getPlannedTasks(network: string, type: string): PlannedTasks[] {
    const tasks = readAndParseJson(path.join(__dirname, '../../', 'tasks.json'));
    const networks = Array.from(new Set(tasks.map(t => t.network)));
    const plannedTasks: PlannedTasks[] = [];
    
    for(const network of networks) {
        const networkTasks = tasks.filter(t => t.network === network);
        plannedTasks.push({ 
            network: network as string, 
            tasks: networkTasks 
        });
    }

    return plannedTasks;
}


function runTask(todo: NetworkTask): Promise<IndexResult> {

    throw new Error("Function not implemented.");
}

export async function runIndexerTasks(network?: string, type?: string): Promise<IndexResult[]> {
    const validation = validateTaskParams(network, type);
    if (validation.errors.length > 0) {
        throw new Error(validation.errors.join('\n'));
    }

    const tasks = await getPlannedTasks(network, type);
    const results: IndexResult[] = [];

    for(const task of tasks) {
        await Promise.all(task.tasks.map(async (todo) => {
            results.push(await runTask(todo));
        }));
    }
    
    return results;   
}