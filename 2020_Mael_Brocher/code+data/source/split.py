from googletrans import Translator

f = open('./wordlists/frwiktionary.txt', encoding='utf-8')
words = f.read().split('\n')
translator = Translator()
arr = []
for word in words:
    tested = word.split(':')
    print(tested[2])
    language = translator.detect(tested[2])
    if ("lang=fr" in language) :
        arr.append(tested[2])
