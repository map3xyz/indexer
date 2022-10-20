import fs from "node:fs/promises";
import path from "node:path";

export function isDev() {
    return process.env.NODE_ENV === 'development';
}

export async function deleteAllFilesInDirectory(dir: string) {
    console.log('🛑 Deleting all files in directory: ' + dir);
    for (const file of await fs.readdir(dir)) {
        await fs.unlink(path.join(dir, file));
    }
}