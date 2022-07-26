import path from 'path';

export const TEST_REGENERATE_MODE = true; // TODO; abstract to env file
export const DEFAULT_TEMP_DIR = './tmp';
export const MAP3XYZ_REPO = 'git@github.com:map3xyz/assets.git';
export const MAP3XYZ_CLONED_REPO_LOC = path.join(DEFAULT_TEMP_DIR, 'map3xyz-assets');
export const TRUSTWALLET_CLONED_REPO_LOC = path.join(DEFAULT_TEMP_DIR, 'trustwallet-assets');
export const TRUSTWALLET_BASE_URL = "https://raw.githubusercontent.com/trustwallet/assets";
export const TRUSTWALLET_REPO = "git@github.com:trustwallet/assets.git";