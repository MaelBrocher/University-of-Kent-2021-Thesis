import spacy
from wordninja import wordninja
from fr_word_segment import wordseg

nlp = spacy.load("fr_core_news_sm")
wordninja.DEFAULT_LANGUAGE_MODEL = wordninja.LanguageModel('./wordlists/wordlist-fr.txt.gz')

with open("../data/richelieu-master/french_passwords_top1000.txt") as myfile:
    head = [next(myfile).strip('\n') for x in range(1000)]
wordlist = head
tab = {}
for passw in wordlist :
    testme = " ".join(wordninja.split(passw))
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
print(tab)
        