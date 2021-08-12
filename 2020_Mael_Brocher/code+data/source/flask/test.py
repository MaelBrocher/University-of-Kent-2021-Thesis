import spacy
from wordninja import wordninjaFr
import time
import threading
import numpy as np
import langid

nlp = spacy.load("fr_core_news_sm")

f = open("../../data/richelieu-master/french_passwords_top1000.txt")
wordlist = f.read().split('\n')
tab = {}

wsize = len(wordlist)
start_time = time.time()
i = 0
for passw in wordlist :
    res = " ".join(wordninjaFr.split(passw))
    doc = nlp(res)
    lang = langid.classify(res)
    if  lang[0] == 'fr' :
        tab[i] = [token.pos_ if token.pos_ != 'X' else 'UKN' for token in doc]
        i += 1
tmp = {}
addme = True
i = 0
for key in tab:
    for a in tmp:
        if tmp[a][0] == tab[key]:
            addme = False
            tmp[a][1] += 1
            break
    if addme == True:
        tmp[i] = [tab[key], 1]
        i += 1
    addme = True

print(lang, end=' ')
print(len(tmp), end=' ')
print(len(tab))
print(tmp)

print("--- {} seconds ---".format((time.time() - start_time)))
