npm install
npm run web
git checkout gh-pages
cp ./web/dist/application.js ./dist/application.js
git add ./dist/application.js
git commit --allow-empty -m "Publish to gh-pages."
git push origin gh-pages
git checkout master
