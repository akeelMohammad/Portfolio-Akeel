const fs = require('fs');

async function analyze() {
  const root = 'https://storytelling.noomoagency.com';
  const htmlRes = await fetch(root + '/');
  const html = await htmlRes.text();
  
  const scriptRegex = /<script[^>]+src="([^">]+)"/g;
  const scriptMatches = [...html.matchAll(scriptRegex)].map(m => m[1]);
  console.log('Script matches in HTML:', scriptMatches);

  const linkRegex = /<link[^>]+href="([^">]+)"/g;
  const linkMatches = [...html.matchAll(linkRegex)].map(m => m[1]);
  console.log('Link matches in HTML:', linkMatches);

  for (const src of scriptMatches) {
    try {
      const url = src.startsWith('http') ? src : root + src;
      const res = await fetch(url);
      const text = await res.text();
      console.log('Fetched', src, 'Length:', text.length);

      const glbMatches = [...text.matchAll(/[\w\/\.\-]+\.(?:glb|gltf|hdr|mp3|ogg|wav)/gi)].map(m => m[0]);
      console.log('3D/audio matches in', src, ':', [...new Set(glbMatches)]);

      const chunkMatches = [...text.matchAll(/[\w\/\.\-]+\.js/gi)].map(m => m[0]);
      console.log('JS chunk matches in', src, ':', [...new Set(chunkMatches)].filter(c => c.includes('_nuxt')).slice(0, 10));
    } catch (e) {
      console.error(e);
    }
  }
}
analyze();
