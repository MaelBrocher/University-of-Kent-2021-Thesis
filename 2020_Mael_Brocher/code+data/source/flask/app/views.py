from app import app

from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
import spacy
from wordninja import wordninjaEn
from wordninja import wordninjaFr
from wordninja import wordninjaDe
import time
import threading

frenchSpacy = spacy.load("fr_core_news_sm")
germanSpacy = spacy.load("de_core_news_sm")
englishSpacy = spacy.load("en_core_web_sm")

class MyThread (threading.Thread):
    def __init__(self, tab, s):
        threading.Thread.__init__(self)
        self.tab = tab
        self.s = s

    def run(self):
        return 1

    def ret(self):
        return self.tab

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/uploadHeatmap")
def upload():
    

@app.route('/semantic', methods=['GET', 'POST'])
def classify():
   message = None
   if request.method == 'POST':
        datafromjs = request.form['mydata']
        wordlist = datafromjs.split("2431ecfe25e234d51b22ff47701d0fae")
        lang = wordlist[0]
        wordlist.pop(0)
        if (lang == 'de'):
            nlp, wordninja = germanSpacy, wordninjaDe
        elif (lang == 'en'):
            nlp, wordninja = englishSpacy, wordninjaEn
        elif (lang == 'fr') :
            nlp, wordninja = frenchSpacy, wordninjaFr
        keys = ["ADJ","ADV","INTJ","NOUN","PROPN","VERB","ADP","AUX","CONJ","CCONJ","DET","NUM","PART","PRON","SCONJ","PUNCT","SYM", "X"]
        tab = {}
        for key in keys:
            tab[key] = [0] * 20

        for passw in wordlist:
            res = " ".join(wordninja.split(passw))
            doc = nlp(res)
            for i, token in enumerate(doc):
                tab[token.pos_][i] += 1
        print(tab)
        resp = make_response(tab)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp
