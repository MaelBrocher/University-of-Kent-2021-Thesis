import threading
import time


class MonThread (threading.Thread):
    def __init__(self, jusqua, s):
        threading.Thread.__init__(self)
        self.jusqua = jusqua
        self.s = s

    def run(self):


    def ret(self):
        return self.jusqua

m = MonThread(10, "A")
m.start()

m2 = MonThread(10, "B")  # crée un second thread
m2.start()                 # démarre le thread,

for i in range(0, 10):
    print("programme ", i)
    time.sleep(0.1)

print(m.ret())
print(m2.ret())