from app import app

from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
import spacy
from wordninja import wordninjaEn
from wordninja import wordninjaFr
from wordninja import wordninjaDe
from time import sleep
import threading
import langid

frenchSpacy = spacy.load("fr_core_news_sm")
germanSpacy = spacy.load("de_core_news_sm")
englishSpacy = spacy.load("en_core_web_sm")
n = open("../data/NAMES.txt")
names = n.read().split('\n')

class MyThread (threading.Thread):
    def __init__(self, wordlist, lang):
        threading.Thread.__init__(self)
        self.words = {}
        self.lang = lang
        self.running = True
        self.wordlist = wordlist

    def run(self):
        if (self.lang  == 'de'):
            nlp, wordninja = germanSpacy, wordninjaDe
        elif (self.lang  == 'en'):
            nlp, wordninja = englishSpacy, wordninjaEn
        elif (self.lang  == 'fr') :
            nlp, wordninja = frenchSpacy, wordninjaFr
        i = 0
        for passw in self.wordlist:
            if passw in names :
                pass
            res = wordninja.split(passw)
            if (len(res) <= len(passw)-2) :
                doc = nlp(" ".join(res))
                detect = langid.classify(passw)
                if detect[0] == self.lang:
                    self.words[i] = [token.pos_ if token.pos_ != 'X' else 'UKN' for token in doc]
                    i += 1
        tmp = {}
        addme = True
        i = 0
        for key in self.words:
            for a in tmp:
                if tmp[a][0] == self.words[key]:
                    addme = False
                    tmp[a][1] += 1
                    break
            if addme == True:
                tmp[i] = [self.words[key], 1]
                i += 1
            addme = True
        self.words = tmp
        self.running = False

    def getRunning(self):
        return self.running
    def getResult(self):
        return self.words

class Heatmaps ():
    def __init__(self):
        self.heatmaps = []
    def addHeatmap(self, heatmap):
        self.heatmaps.append(heatmap)
    def getHeatmapFromName(self, s):
        for h in self.heatmaps:
            if h.name == s :
                return h
        return None

class Heatmap ():
    def __init__(self, name):
        self.name = name
        self.dataFr = None
        self.dataEn = None
        self.dataDe = None

    def getName(self):
        return self.name
    def getDataFr(self):
        return self.dataFr
    def getDataEn(self):
        return self.dataEn
    def getDataDe(self):
        return self.dataDe

    def setDataFr(self,data):
        self.dataFr = data
    def setDataEn(self,data):
        self.dataEn = data
    def setDataDe(self, data):
        self.dataDe = data

@app.route("/")
def index():
    return render_template("home.html")

@app.route('/uploadHeatmap2', methods=['POST'])
def uploadHeatmap2():
    if request.method == 'POST':
        datafromjs = request.form['mydata']
        resp = make_response(datafromjs)        
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp


@app.route('/uploadHeatmap', methods=['POST'])
def uploadHeatmap():
    if request.method == 'POST':
        datafromjs = request.form['mydata']
        wordlist = datafromjs.split("2431ecfe25e234d51b22ff47701d0fae")
        hname = wordlist[0]
        wordlist.pop(0)
        if heatmaps.getHeatmapFromName(hname) == None :
            tFr = MyThread(wordlist, 'fr')
            tDe = MyThread(wordlist, 'de')
            tEn = MyThread(wordlist, 'en')

            tFr.start()
            tDe.start()
            tEn.start()

            while tFr.getRunning() == True or tDe.getRunning() == True or tEn.getRunning() == True:
                sleep(0.01)

            heatmap = Heatmap(hname)
            heatmap.setDataFr(tFr.getResult())
            heatmap.setDataDe(tDe.getResult())
            heatmap.setDataEn(tEn.getResult())

            heatmaps.addHeatmap(heatmap)
    
        resp = make_response(hname)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp

@app.route('/semantic', methods=['POST'])
def semantic():
    if request.method == 'POST':
        datafromjs = request.form['mydata']
        hnames = datafromjs.split("2431ecfe25e234d51b22ff47701d0fae")
        lang, name = hnames[0], hnames[1]
        res = {}
        askedHeatmap = heatmaps.getHeatmapFromName(name)
        if askedHeatmap != None:
            if lang == "fr":
                if askedHeatmap.getDataFr() != None:
                    res = askedHeatmap.getDataFr()
                else:
                    res = "Data for " +askedHeatmap.getName() + " and French semantic not ready yet"
            if lang == "de":
                if askedHeatmap.getDataDe() != None:
                    res = askedHeatmap.getDataDe()
                else:
                    res = "Data for " +askedHeatmap.getName() + " and German semantic not ready yet"
            if lang == "en":
                if askedHeatmap.getDataEn() != None:
                    res = askedHeatmap.getDataEn()
                else:
                    res = "Data for " +askedHeatmap.getName() + " and English semantic not ready yet"
        else :
            res = "Data not ready yet"
        resp = make_response(res)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp

def tabGenerator():
    keys = ["ADJ","ADV","INTJ","NOUN","PROPN","VERB","ADP","AUX","CONJ","CCONJ","DET","NUM","PART","PRON","SCONJ","PUNCT","SYM", "X"]
    tab = {}
    for key in keys:
        tab[key] = [0] * 25
    return tab

heatmaps = Heatmaps()