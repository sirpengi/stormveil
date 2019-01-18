# This script builds the UI project and pushes a new commit to the gh-pages
# branch.
Directory=$HOME/stormveil-gh-pages

# Build the project.
npm run prepare
cd packages/stormveil-ui
npm run bundle

# # Clone the gh-pages branch into a new, temporary directory to safely copy
# # the contents over.
git clone --single-branch --branch gh-pages git@github.com:samcf/stormveil.git $Directory
cp -r web/. $Directory/

# # Commit and push the changes to gh-pages.
cd $Directory
git add --all
git commit --allow-empty --amend -m "Publish to GitHub pages."
git push --force-with-lease origin gh-pages

# # Cleanup the temporary directory.
cd $HOME
rm -rf $Directory
