from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
import spacy
from wordninja import wordninja

app = Flask(__name__)
frenchSpacy = spacy.load("fr_core_news_sm")
germanSpacy = spacy.load("de_core_news_sm")
englishSpacy = spacy.load("en_core_web_sm")

@app.route("/")
def home():
    return "hi"
@app.route("/index")

@app.route('/test', methods=['GET', 'POST'])
def login():
   message = None
   if request.method == 'POST':
        datafromjs = request.form['mydata']
        wordlist = datafromjs.split("2431ecfe25e234d51b22ff47701d0fae")

        resp = make_response(result)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp
        return render_template('login.html', message='')

@app.route('/semantic', methods=['GET', 'POST'])
def classify():
   message = None
   if request.method == 'POST':
        datafromjs = request.form['mydata']
        wordlist = datafromjs.split("2431ecfe25e234d51b22ff47701d0fae")
        lang = wordlist[0]
        wordlist.pop(0)
        if (lang == 'de'):
            nlp = germanSpacy
        elif (lang == 'en'):
            nlp = englishSpacy
        elif (lang == 'fr') :
            nlp = frenchSpacy
        wordninja.DEFAULT_LANGUAGE_MODEL = wordninja.LanguageModel('./wordlists/wordlist-' + lang +'.txt.gz')
        print('dictionnary loaded')
        tab = {}
        for passw in wordlist :
            testme = " ".join(wordninja.split(passw))
            if len(wordninja.split(passw)) <= len(passw):
                testme = passw
            doc = nlp(testme)
            for i , token in enumerate(doc):
                try:
                    tab[token.pos_]
                except KeyError:
                    num = [0] * (int(i)+1)
                    num[i] = 1
                    tab[token.pos_] = num
                else:
                    if i >= len(tab[token.pos_]):
                        for j in range(i - len(tab[token.pos_]) +1):
                            tab[token.pos_].append(0)             
                    tab[token.pos_][i] += 1
        resp = make_response(tab)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp
        return render_template('login.html', message='')


if __name__ == "__main__":
    app.run(debug = True)
