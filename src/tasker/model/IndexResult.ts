export abstract class IndexResult { 
    success: boolean;
    network: string;
    type: string;
    source: string;
    verified: boolean;
    tokensIndexed: number;
    errors: string[];

    toString(): string {
        if(this.success) {
            return `✅ ${this.type}: ${this.source} indexed ${this.tokensIndexed} tokens on network ${this.network} with status ${this.verified ? 'verified' : 'not verified'}`;
        } else {
            return `🚨 ${this.type}: ${this.source} ${this.network} indexing errors -> ${this.errors.join(" \n")}`;
        }
    }
}