npm run prepare
cd ./packages/stormveil-ui/
npm run bundle
tar zcvf $env:temp\stormveil-ui.gz web
cd ../../
git checkout gh-pages
git clean -fd
tar zxvf $env:temp\stormveil-ui.gz --strip-components=1
git add -u
# git commit --amend "Publish to GitHub pages."
# git push origin gh-pages --force-with-lease
