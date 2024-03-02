import * as esbuild from 'esbuild';

(async () => {
  await esbuild.build({
    entryPoints: ['./server/server.ts'],
    bundle: true,
    platform: 'node',
    target: ['node20.0'],
    outfile: 'build/server.js',
    plugins: [],
  });
})();
