import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def main():
    driver = webdriver.Chrome('./chromedriver.exe')
    arr = ["5000","5001-10000.wiki", "10001-15000.wiki", "15001-20000.wiki"]
    for page in arr :
        driver.get("https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists/French_wordlist_opensubtitles_" + page)
        if page == "5000":
            for i in range(2, 51):
                print(driver.find_element_by_xpath("/html/body/div[3]/div[3]/div[5]/div[1]/table/tbody/tr["+ str(i) + "]/td[2]/span/a").text)
            for i in range(52, 5001):
                print(driver.find_element_by_xpath("/html/body/div[3]/div[3]/div[5]/div[1]/table/tbody/tr[" +str(i) + "]/td[2]/a").text)
        else :
            for i in range(2, 5001):
                print(driver.find_element_by_xpath("/html/body/div[3]/div[3]/div[5]/div[1]/table/tbody/tr[" +str(i) + "]/td[2]/a").text)

if __name__ == '__main__':
    main()