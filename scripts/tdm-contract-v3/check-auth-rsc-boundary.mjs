#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd(), errors=[];
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const req=(value,message)=>{ if(!value) errors.push(message); };

const rootFacade=read('src/features/auth/index.ts');
const serverFacade=read('src/features/auth/server/index.ts');
const loginRoute=read('src/app/login/page.tsx');
const authPage=read('src/features/auth/auth-page.tsx');
const session=read('src/features/auth/server/auth-session.ts');

req(!rootFacade.includes('AuthPage'), 'root Auth facade must not export server-rendered AuthPage');
req(!rootFacade.includes('./server') && !rootFacade.includes('./auth-page'), 'root Auth facade must not reach server-only modules');
req(rootFacade.includes('AuthUser') && rootFacade.includes('UserMenu'), 'root Auth facade lost approved client/domain-safe exports');
req(serverFacade.includes("export { AuthPage } from '../auth-page';"), 'Auth server facade must export AuthPage');
req(serverFacade.includes('requireAuthenticatedSession'), 'Auth server facade lost session API');
req(loginRoute.includes("from '@/features/auth/server'"), '/login must consume AuthPage through explicit Auth server facade');
req(!loginRoute.includes("from '@/features/auth'"), '/login must not pull server AuthPage from client-safe root facade');
req(authPage.includes("./server/auth-session"), 'AuthPage must remain server-owned');
req(session.includes("from 'next/headers'"), 'auth-session must remain the explicit next/headers server boundary');

function walk(dir){
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
    const full=path.join(dir,entry.name);
    return entry.isDirectory()?walk(full):[full];
  });
}

const clientImporters=[];
for(const file of walk(path.join(root,'src')).filter(file=>/\.(ts|tsx)$/.test(file))){
  const source=fs.readFileSync(file,'utf8');
  const firstMeaningful=source.split(/\r?\n/).find(line=>line.trim() && !line.trim().startsWith('//'))?.trim();
  const isClient=firstMeaningful==="'use client';" || firstMeaningful==='"use client";';
  if(isClient && /from\s+['\"]@\/features\/auth\/server(?:['\"]|\/)/.test(source)){
    clientImporters.push(path.relative(root,file));
  }
}
req(clientImporters.length===0, `client modules import Auth server facade: ${clientImporters.join(', ')}`);

if(errors.length){
  console.error('\nTDM AUTH RSC BOUNDARY: FAIL\n');
  errors.forEach((error,index)=>console.error(`${index+1}. ${error}.`));
  process.exit(1);
}
console.log('PASS TDM Auth RSC Boundary: the root Auth facade is client/domain-safe, server-only AuthPage/session APIs stay on the explicit server facade, and no client module imports Auth server code.');
