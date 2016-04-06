#!/bin/bash

echo ""
echo "┏━━━━━━━━┓"
echo "┃  T  E  ┃"
echo "┃  N  4 ━┛"
echo "┗━━━━━┛"
echo ""
echo "Do you want to install craft or slim?"
echo ""
read cms

# Idiot check
if [ $cms != "craft" ] && [ $cms != "slim" ]
then
	echo "Don't be a dingus"
	exit 1
fi

# Install Craft (before framework)
if [ $cms = "craft" ]
then
	echo "Installing Craft..."
	curl -Ls -o craft_latest.tar.gz http://buildwithcraft.com/latest.tar.gz?accept_license=yes
	tar -xz -f craft_latest.tar.gz
	rm craft_latest.tar.gz
	rm -r craft/templates
	rm craft/web.config
	mv public public_html
	rm public_html/htaccess
	rm public_html/web.config
	rm public_html/index.php
	rm readme.txt
	echo "Craft installed!"
fi

# Install Ten4 Framework
echo "Installing Ten4 framework..."
curl -Ls -o framework_latest.tar.gz https://github.com/ten4design/ten4-framework/archive/master.tar.gz
tar -xz -f framework_latest.tar.gz
rm framework_latest.tar.gz
rm ten4-framework-master/.gitignore
if [ $cms = "craft" ]
then
	rm -r ten4-framework-master/app
	rm -r ten4-framework-master/craft/plugins/ten4sitesetup
	rm ten4-framework-master/public_html/index_slim.php
	mv ten4-framework-master/public_html/index_craft.php ten4-framework-master/public_html/index.php
	rm ten4-framework-master/.gitignore_slim
	mv ten4-framework-master/.gitignore_craft ten4-framework-master/.gitignore
else
	rm -r ten4-framework-master/craft
	rm ten4-framework-master/public_html/index_craft.php
	mv ten4-framework-master/public_html/index_slim.php ten4-framework-master/public_html/index.php
	rm ten4-framework-master/.gitignore_craft
	mv ten4-framework-master/.gitignore_slim ten4-framework-master/.gitignore
fi
rm ten4-framework-master/readme.md
rm ten4-framework-master/LICENSE.txt
cp -r ten4-framework-master/. .
rm -r ten4-framework-master
rm -r addons
mkdir raw/img
mkdir raw/fonts
echo "Ten4 framework installed!"

# Install Slim (after framework)
if [ $cms = "slim" ]
then
	echo "Installing Slim..."
	curl -sS https://getcomposer.org/installer | php -- --install-dir=app
	php app/composer.phar --working-dir=app install
	mkdir app/cache
	echo "Slim installed!"
fi

# Initialise Git and add site setup submodule
echo "Initialising Git..."
git init
if [ $cms = "craft" ]
then
	git submodule add -f https://github.com/ten4design/ten4-site-setup.git craft/plugins/ten4sitesetup
fi
echo "Git initialised!"

# Install NPM packages
echo "Installing NPM packages..."
npm install
echo "NPM packages installed!"

# Show a prompt to delete this script
rm -i $0

exit 0