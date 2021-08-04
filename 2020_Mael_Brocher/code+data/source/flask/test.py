import spacy
from wordninja import wordninjaFr
import time
import threading
import numpy as np
from spacy_langdetect import LanguageDetector

nlp = spacy.load("fr_core_news_sm")

class MyThread (threading.Thread):
    def __init__(self, tab, words, part):
        threading.Thread.__init__(self)
        self.tab = tab
        self.words = words
        self.part = part

    def run(self):
        for passw in self.words :
            res = " ".join(wordninjaFr.split(passw))
            doc = nlp(res)
            for i, token in enumerate(doc):
                self.tab[token.pos_][i] += 1

    def ret(self):
        return self.tab

f = open("../../data/pword-w-count/10k most common with frequency.txt", encoding='latin1')
wordlist = f.read().split('\n')
keys = ["ADJ","ADV","INTJ","NOUN","PROPN","VERB","ADP","AUX","CONJ","CCONJ","DET","NUM","PART","PRON","SCONJ","PUNCT","SYM", "X"]
tab = {}
for key in keys:
    tab[key] = [0] * 16

nlp.add_pipe(LanguageDetector())
wsize = len(wordlist)
start_time = time.time()
for a, passw in enumerate(wordlist) :
    res = " ".join(wordninjaFr.split(passw))
    doc = nlp(res)
    print(doc._.language)
    for i, token in enumerate(doc):
        tab[token.pos_][i] += 1
print("--- {} seconds ---".format((time.time() - start_time)))

print(tab)
        