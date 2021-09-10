from numpy.lib.shape_base import tile
from app import app
import numpy as np

from flask import Flask, render_template, redirect, url_for,request
from flask import make_response
import spacy
from wordninja import wordninjaEn
from wordninja import wordninjaFr
import time
import fasttext 


model = fasttext.load_model('./model/lid.176.ftz')

frenchSpacy = spacy.load("fr_core_news_sm")
englishSpacy = spacy.load("en_core_web_sm")
frenchSpacy.disable_pipes("ner", "lemmatizer", "parser")
englishSpacy.disable_pipes("ner", "lemmatizer", "parser")

frfilenames = open("./wordlists/FrNames.txt")
FrNamesLower = dict.fromkeys(frfilenames.read().split('\n'), None)
FrNamesUpper = dict.fromkeys([n.upper() for n in frfilenames.read().split('\n')], None)
FrNamesTitle = dict.fromkeys([n.title() for n in frfilenames.read().split('\n')], None)
frfilenames.close()

enfilenames = open("./wordlists/EnNames.txt")
EnNamesLower = dict.fromkeys(enfilenames.read().split('\n'), None)
EnNamesUpper = dict.fromkeys([n.upper() for n in enfilenames.read().split('\n')], None)
EnNamesTitle = dict.fromkeys([n.upper() for n in enfilenames.read().split('\n')], None)
enfilenames.close()

#check if wordninja didn't create small group of 1 letter, if yes it will be removed
def remove(res):
    oneletterchunk = 0
    for r in res:
        if len(r) == 1:
            oneletterchunk += 1
    if oneletterchunk >= 4:
        return True
    return False

#check if the semantic is in the array
def check(sem, needs):
    res = list(np.intersect1d(sem, needs))
    if res == needs:
        indexs = [sem.index(n) for n in needs]
        return sorted(indexs) == list(range(min(indexs), max(indexs)+1))
    return False

#return words based on the semantic needed if nothing asked return only the word in the language asked
def get_hm_from_semantic(words, req, lang):
    dict = {}
    needs = req.split('+')
    if req == "":
        for w in words:
            if words[w][1] == lang:
                dict[w] = words[w][2]
    else :
        for w in words:
            if len(words[w][0]) >= len(needs):
                if check(words[w][0], needs) == True and words[w][1] == lang:
                    dict[w] = words[w][2]

    return dict

#return the semantic of a heatmap, on {words : occurence} format
def extractSemantic(words, lang):
    tmp = {}
    addme = True
    i = 0
    tmps = []
    for w in words:
        if words[w][1] == lang:
            tmps.append(words[w][0])
    for v in tmps:
        for a in tmp:
            if tmp[a][0] == v:
                addme = False
                tmp[a][1] += 1
                break
        if addme == True:
            tmp[i] = [v, 1]
            i += 1
        addme = True
    return tmp

#list of heatmaps stored in the server
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
    def getNames(self):
        s = ""
        for h in self.heatmaps:
            s += h.name + "\n"
        return s

#Heatmap storage
class Heatmap ():
    def __init__(self, name):
        self.name = name
        self.data = None

    def getName(self):
        return self.name
    def getData(self):
        return self.data

    def setData(self,data):
        self.data = data

#return the html template of the webpage
@app.route("/")
def index():
    return render_template("home.html")

#API route called when a heatmap is upload. it can take to 3min for the biggest wordlists
@app.route('/uploadHeatmap', methods=['POST'])
def uploadHeatmap():
    if request.method == 'POST':
        hname = request.form['hname']
        wordlist = request.form['words'].split("2431ecfe25e234d51b22ff47701d0fae")
        wordlist = dict.fromkeys(wordlist, None)
        words = {}

        if heatmaps.getHeatmapFromName(hname) == None :
            start_time = time.time()
            for passw in wordlist:

                try :
                    password = passw.split(',')[0]
                    number = int(passw.split(',')[1])
                except :
                    print(passw)
                    continue

                nlp, wordninja = englishSpacy, wordninjaEn
                words[password] = [[], None, number]
                words[password][1] = model.predict(password)[0][0][-2:]

                nlp = englishSpacy if words[password][1] == 'en' else frenchSpacy if words[password][1]  == 'fr' else englishSpacy
                wordninja = wordninjaEn if words[password][1] == 'en' else wordninjaFr if words[password][1]  == 'fr' else wordninjaEn
                res = dict.fromkeys(wordninja.split(password), None)


                if remove(res) == False:
                    doc = nlp(" ".join(res))

                    words[password][0] = ['NAME' if token.text.lower() in FrNamesLower or token.text.title() in FrNamesTitle or token.text.upper() in FrNamesUpper else 'NAME' if token.text.lower() in EnNamesLower or token.text.title() in EnNamesTitle or token.text.upper() in EnNamesUpper else 'UKN' if token.pos_ == 'X' else token.pos_ for token in doc]

                    if words[password][0][0] == 'NUM' and len(words[password][0]) == 1:
                        words.pop(password)
                else :
                    words.pop(password)

            try :
                words.pop("password")
            except:
                pass
            print("--- {} seconds ---".format(round((time.time() - start_time), 2)))
            heatmap = Heatmap(hname)
            heatmap.setData(words)
            heatmaps.addHeatmap(heatmap)
        resp = make_response(hname)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp

#API route that return the dict of words of a heatmap base on the semantic needed
@app.route('/heatmapFromSemantic', methods=['POST'])
def semantic_heatmap():
    if request.method == 'POST':
        hname = request.form['hname']
        req = request.form['req']
        lang = request.form['lang']
        askedHeatmap = heatmaps.getHeatmapFromName(hname)
        if askedHeatmap != None:
            res = get_hm_from_semantic(askedHeatmap.getData(), req, lang)
        else :
            res = "Cannot find any data"
        resp = make_response(res)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp

#API route that return semantic heatmap
@app.route('/semantic', methods=['POST'])
def semantic():
    if request.method == 'POST':
        lang = request.form['lang']
        hname = request.form['hname']
        res = {}
        askedHeatmap = heatmaps.getHeatmapFromName(hname)
        if askedHeatmap != None:
            res = extractSemantic(askedHeatmap.getData(), lang)
        else :
            res = "Data not ready yet"
        resp = make_response(res)
        resp.headers['Content-Type'] = "application/json"
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Headers', 'Authorization, Content-Type')
        resp.headers.add('Access-Control-Allow-Methods', 'POST')
        return resp


heatmaps = Heatmaps()