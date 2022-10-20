import path from 'path';

import dotenv from 'dotenv';

dotenv.config();

export const TEST_REGENERATE_MODE = false; // Do not turn on as it's buggy generating empty in.json files
export const DEFAULT_TEMP_DIR = './tmp';
export const MAP3XYZ_REPO = 'git@github.com:map3xyz/assets.git';
export const MAP3XYZ_CLONED_REPO_LOC = path.join(DEFAULT_TEMP_DIR, 'map3xyz-assets');
export const TRUSTWALLET_CLONED_REPO_LOC = path.join(DEFAULT_TEMP_DIR, 'trustwallet-assets');
export const TWA_USER_CONTENT_BASE = "https://raw.githubusercontent.com/trustwallet/assets/master";
export const TRUSTWALLET_REPO = "git@github.com:trustwallet/assets.git";

export const MAINNET_PROVIDER_URL = process.env.MAINNET_PROVIDER_URL || '';