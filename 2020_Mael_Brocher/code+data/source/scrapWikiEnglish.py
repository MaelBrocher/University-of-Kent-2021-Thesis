import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def main():
    driver = webdriver.Chrome('./chromedriver.exe')
    arr = ["1-10000","10001-20000", "20001-30000", "30001-40000"]
    for page in arr :
        driver.get("https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/PG/2006/04/" + page)
        for j in range (1, 10) :
            for i in range(2, 1001):
                if page == "30001-40000" and j == 7 and i == 665:
                    return
                print(driver.find_element_by_xpath("/html/body/div[3]/div[3]/div[5]/div[1]/table[" + str(j) +"]/tbody/tr[" + str(i)+ "]/td[2]/a").text)

if __name__ == '__main__':
    main()