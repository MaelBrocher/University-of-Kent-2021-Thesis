To read my paper go to this [Link](https://nbviewer.org/github/MaelBrocher/University-of-Kent-2021-Thesis/blob/main/dissertation/maeb3_dissertation.pdf)

If you want to try by yourself then follow these instructions :

Make sure you have python3 installed, if so just type "sudo ./init.sh" or type the commands in the second section.
If not : 

    sudo apt-get install python3

Then do :

    sudo apt-get install python3-pip
    pip install --upgrade pip
    pip install setuptools wheel spacy flask fasttext
    python -m spacy download en_core_web_sm
    python -m spacy download fr_core_news_sm
    flask run 

And open your browser at localhost:5000/