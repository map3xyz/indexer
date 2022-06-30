import { NetworkTask } from "./NetworkTask";

export interface PlannedTasks {
    network: string;
    tasks: NetworkTask[];
}

export interface IndexerCommandValidationResult {
    valid: boolean;
    errors: string[];
}