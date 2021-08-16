#!/bin/sh
apt-get update  #to update everything
apt-get install -y python3-pip #install pip
/usr/bin/python3 -m pip install --upgrade pip
/usr/bin/python3 -m pip install pip setuptools wheel spacy #install needed package
/usr/bin/python3 -m spacy download en_core_web_sm #en version
/usr/bin/python3 -m spacy download fr_core_news_sm #fr version of spacy
/usr/bin/python3 -m spacy download de_core_news_sm #german version
/usr/bin/python3 -m pip install flask #install server module
