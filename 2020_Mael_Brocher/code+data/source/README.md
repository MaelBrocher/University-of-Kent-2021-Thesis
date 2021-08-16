Make sure to have python3 install, if so juste type "sudo ./init.sh"
If not : 

    sudo apt-get install python3

Then do :

    sudo apt-get install python3-pip
    pip install --upgrade pip
    pip install setuptools wheel spacy flask langid
    python -m spacy download en_core_web_sm
    python -m spacy download fr_core_news_sm
    python -m spacy download de_core_news_sm
    cd flask && flask run 

And open your browser at localhost:5000/