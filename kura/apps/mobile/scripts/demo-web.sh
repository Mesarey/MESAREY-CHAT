#!/bin/bash
# Exporta la web en un solo bundle (sin rutas asíncronas) y arma dist-demo/index.html.
set -e
cd "$(dirname "$0")/.."
cp app.json /tmp/app.json.bak
trap 'cp /tmp/app.json.bak app.json' EXIT
node -e "const f='app.json',j=require('./'+f);j.expo.plugins=j.expo.plugins.map(p=>p==='expo-router'?['expo-router',{asyncRoutes:{web:false,default:false}}]:p);require('fs').writeFileSync(f,JSON.stringify(j,null,2))"
rm -rf dist && CI=1 npx expo export -p web --clear
node scripts/demo-web.mjs
