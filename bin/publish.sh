npm run prepare
cd ./packages/stormveil-ui/
npm run bundle
tar zcvf $env:temp\stormveil-ui.gz web
git checkout gh-pages
tar zxvf $env:temp\stormveil-ui.gz --strip-components=1
git add --all
git commit --amend "Publish to GitHub pages."
git push origin gh-pages --force-with-lease
