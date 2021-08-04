Make sure to have python3 and pip3 install</br>
Then do :</br>
python3 -m venv env</br>
source env/bin/activate</br>
pip install --upgrade pip</br>
pip install pip setuptools wheel </br>
pip install spacy</br>
python -m spacy download en_core_web_sm
python -m spacy download fr_core_news_sm
python -m spacy download de_core_news_sm
pip install -r requirement.txt</br>
python3 run.py </br>
And open your browser at localhost:5000/</br>