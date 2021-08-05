Make sure to have python3 install</br>
if not : </br>
sudo apt-get install python3
Then do :</br>
sudo apt-get install python3-pip python3-venv
python3 -m venv env</br>
source env/bin/activate</br>
pip install --upgrade pip</br>
pip install setuptools wheel spacy flask langid</br>
python -m spacy download en_core_web_sm
python -m spacy download fr_core_news_sm
python -m spacy download de_core_news_sm
python3 run.py </br>
And open your browser at localhost:5000/</br>