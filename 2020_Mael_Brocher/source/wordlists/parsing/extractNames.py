def getEnglishNames(en, fr):
    f = open('./firstnames.txt', encoding='latin1')
    names = dict.fromkeys(f.read().split('\n'), None)
    f.close()

    f = open('../EnNames.txt', 'w')
    for w in names:
        if len(w) >= 3 and w.lower() not in en and w.lower() not in fr:
            f.write(w.lower() + "\n")

def getfrenchNames(en, fr):
    z = open('./prenom.csv', encoding='latin1')
    names = dict.fromkeys(z.read().split('\n'),None)
    z.close()

    z = open('../FrNames.txt', 'w')
    for w in names:
        popularity = int(w.split(',')[1])
        w = w.split(',')[0]
        if len(w) >= 3 and popularity >= 10 and w.lower() not in en and w.lower() not in fr:
            z.write(w.lower()+"\n")

if __name__=="__main__":
    x = open('../../../data/word-data/french.dic', encoding='latin1')
    fr = dict.fromkeys(x.read().split('\n'), None)
    y = open('../../../data/word-data/english.txt', encoding='latin1')
    en = dict.fromkeys(y.read().split('\n'), None)
    en_dict = dict.fromkeys([e.lower() for e in en], None)

    getfrenchNames(en, fr)
    getEnglishNames(en, fr)