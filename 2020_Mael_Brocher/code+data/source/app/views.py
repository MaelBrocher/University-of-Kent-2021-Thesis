from app import app

from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
import spacy
from wordninja import wordninjaEn
from wordninja import wordninjaFr
from wordninja import wordninjaDe

frenchSpacy = spacy.load("fr_core_news_sm")
germanSpacy = spacy.load("de_core_news_sm")
englishSpacy = spacy.load("en_core_web_sm")

@app.route("/")
def index():
    return render_template("index.html")

@app.route('/semantic', methods=['GET', 'POST'])
def classify():
   message = None
   if request.method == 'POST':
        datafromjs = request.form['mydata']
        wordlist = datafromjs.split("2431ecfe25e234d51b22ff47701d0fae")
        lang = wordlist[0]
        wordlist.pop(0)
        wsize = len(wordlist)
        if (lang == 'de'):
            nlp, wordninja = germanSpacy, wordninjaDe
        elif (lang == 'en'):
            nlp, wordninja = englishSpacy, wordninjaEn
        elif (lang == 'fr') :
            nlp, wordninja = frenchSpacy, wordninjaFr
        tab = {}
        print("received")
        for a, passw in enumerate(wordlist):
            if a % 20 == 0 :
                print(str(round(a/wsize* 100,1)) + "%")
            res = wordninja.split(passw)
            testme = " ".join(res)
            if len(res) <= len(passw):
                testme = passw
            doc = nlp(testme)
            for i , token in enumerate(doc):
                try:
                    tab[token.pos_]
                except KeyError:
                    num = [0] * (int(i)+1)
                    num[i] = 1
                    tab[token.pos_] = num
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
