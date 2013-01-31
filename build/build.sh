echo "Building application..."
node r.js -o app.build.js
echo "Building is done"
echo ""
echo ""

echo "Cleannig up the release directory..."
rm ../release/build.txt
rm ../release/scripts/.gitignore
rm -r ../release/scripts/app
rm -r ../release/scripts/lib/jquery
rm -r ../release/scripts/lib/mustache
rm -r ../release/scripts/lib/requirejs-i18n
echo "DONE"
