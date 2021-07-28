make sure to have python3 and pip3 install
then do :
    pip3 install -U pip setuptools wheel
    pip install -U spacy
    python -m spacy download en_core_web_sm
    python -m spacy download fr_core_news_sm
    python -m spacy download de_core_news_sm
    pip3 install flask
and run with index.html open in browser: python3 app.py