import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def main():
    driver = webdriver.Chrome('./chromedriver.exe')
    arr = ["1-5000","5001-10000", "10001-15000", "15001-20000", "20001-25000", "25001-30000", "30001-35000", "35001-40000", "45001-50000"]
    for page in arr :
        driver.get("https://en.wiktionary.org/wiki/User:Matthias_Buchmeier/German_frequency_list-" + page)
        for j in range (1, 5001) :
            try :
                print(driver.find_element_by_xpath("/html/body/div[3]/div[3]/div[5]/div[1]/p/a[" + str(j) +"]").text)
            except:
                pass
if __name__ == '__main__':
    main()