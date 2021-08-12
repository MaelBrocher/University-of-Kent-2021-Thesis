import sys
from langdetect import detect

def openme():
    f = open('./wordlists/Lexique383.csv', encoding='latin1')
    words = f.read().split('\n')
    return words

def callme(words):
    for i, word in enumerate(words):
        print(word.split(',')[0])
        sys.stderr.write(str(round( (i/len(words)) * 100,3 ) ) + " %\n" )


if __name__=="__main__":
    callme(openme())