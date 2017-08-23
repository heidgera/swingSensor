#!/bin/bash

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

sudo apt-get install --no-install-recommends xserver-xorg xinit xserver-xorg-video-fbdev xserver-xorg-video-fbturbo libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6

git clone https://github.com/heidgera/swingSensor

cd swingSensor

git submodule init

git submodule update

npm i

cd piFig

sudo node installPi.js
