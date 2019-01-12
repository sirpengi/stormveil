npm install
npm run compile-browser
git checkout gh-pages
cp ./web/dist/ui.bundle.js ./dist/ui.bundle.js
git add ./dist/ui.bundle.js
git commit --allow-empty -m "Publish to gh-pages."
git push origin gh-pages
git checkout master
