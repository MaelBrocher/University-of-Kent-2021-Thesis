def getEnglishNames(en, fr):
    #open first name file
    f = open('./firstnames.txt', encoding='latin1')
    names = dict.fromkeys(f.read().split('\n'), None)
    f.close()

    #create EnNames.txt with names longer than 2 char to avoid detection of rare name such as So, In, Le and Ma that could be words
    f = open('../EnNames.txt', 'w')
    for w in names:
        if len(w) >= 3 and w.lower() not in en and w.lower() not in fr:
            f.write(w.lower() + "\n")


def getfrenchNames(en, fr):
    z = open('./prenom.csv', encoding='latin1')
    names = dict.fromkeys(z.read().split('\n'),None)
    z.close()
    dictpopularity = {}
    #create FrNames.txt with names longer than 2 char to avoid detection of rare names
    #Moreover this data comes from https://www.data.gouv.fr/fr/datasets/liste-de-prenoms-et-patronymes/ which is all first name in france.
    #I decided that first name present less than 10 times in france are taken in account to reduce the size of the wordlist
    analysis = False
    z = open('../FrNames.txt', 'w')
    total = 0
    for w in names:
        popularity = int(w.split(',')[1])
        w = w.split(',')[0]
        if len(w) >= 3 and popularity >= 10 and w.lower() not in en and w.lower() not in fr:
            z.write(w.lower()+"\n")
        if analysis == True:
            try :
                dictpopularity[popularity] += 1
            except:
                dictpopularity[popularity] = 1
            total += 1
    if analysis == True:
        d = dict(sorted(dictpopularity.items(), key=lambda item: item[1]))
        tlist = sorted(reversed([(k, d[k]) for k in d]), key=lambda x:x[0])

        test = 0
        test2 = 0
        r = 100
        for i in range(r):
            test += tlist[i][1]
            test2 += tlist[i][0] * tlist[i][1]
        print(str(r) + " less common first name represent " + str(round(test/total * 100,2)) + "%% of all names")
        n = 0
        for a in tlist:
            n += a[0] * a[1]
        print("but represent " + str(round(test2/ n *100, 2)) + "%% of the population")

if __name__=="__main__":
    #Open french dictionnary
    x = open('../../../data/word-data/french.dic', encoding='latin1')
    fr = dict.fromkeys(x.read().split('\n'), None)
    #Open english dictionnary
    y = open('../../../data/word-data/english.txt', encoding='latin1')
    en = dict.fromkeys(y.read().split('\n'), None)
    en_dict = dict.fromkeys([e.lower() for e in en], None)

    getfrenchNames(en, fr)
    getEnglishNames(en, fr)