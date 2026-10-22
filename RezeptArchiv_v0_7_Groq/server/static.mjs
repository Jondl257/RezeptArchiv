import path from 'node:path';
export function resolveStaticFile(directory,urlPath){
 const root=path.resolve(directory),decoded=decodeURIComponent(urlPath),relative=decoded==='/'?'index.html':decoded.replace(/^\//,'');
 const file=path.resolve(root,relative);
 if(!file.startsWith(root+path.sep))throw Error('Datei außerhalb des öffentlichen Ordners.');
 return file;
}
