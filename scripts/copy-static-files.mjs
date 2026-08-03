import { cp, mkdir } from 'node:fs/promises';

await mkdir('dist/nodes/Reepl', { recursive: true });
await cp('nodes/Reepl/reepl.svg', 'dist/nodes/Reepl/reepl.svg');
