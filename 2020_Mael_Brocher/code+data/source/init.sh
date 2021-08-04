#!/bin/bash
apt-get install python3-venv
apt-get install python3-pip
/usr/bin/python3 -m venv env
source $1/bin/activate
/usr/bin/python3 -m pip install --upgrade pip
/usr/bin/python3 -m pip install pip setuptools wheel
/usr/bin/python3 -m pip install spacy
/usr/bin/python3 -m spacy download en_core_web_sm
/usr/bin/python3 -m spacy download fr_core_news_sm
/usr/bin/python3 -m spacy download de_core_news_sm
/usr/bin/python3 -m pip install flask
