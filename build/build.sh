echo "Building application..."
node r.js -o app.build.js
echo "Building is done"
echo ""
echo ""

cd ../release

echo "Cleannig up the release directory..."
rm build.txt

cd scripts
rm .gitignore
rm -r app
rm -r lib/jquery
rm -r lib/mustache
rm -r lib/requirejs-i18n
echo "DONE"
