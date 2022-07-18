import test from 'ava';
import { fetchTokenlistForNetwork } from './tokenlists';

test('aave tokenlist resolves', async t => {
    const url = 'https://wispy-bird-88a7.uniswap.workers.dev/?url=http://tokenlist.aave.eth.link';
    const aaveTokenlist = await fetchTokenlistForNetwork(url, 'ethereum');
    t.truthy(aaveTokenlist);
});