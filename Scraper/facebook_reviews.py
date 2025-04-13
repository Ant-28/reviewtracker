from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from sys import argv, exit, stderr
import time
import os
import sys
import json
from typing import Optional, Dict
import undetected_chromedriver as uc
import re
# https://stackoverflow.com/questions/5925918/python-suppressing-errors-from-going-to-commandline

class ourChrome(uc.Chrome):
    def __del__(self):
        try:
            self.service.process.kill()
            self.quit()
        except:  # noqa
            pass
        
   
# CHANGE THIS FOR FACEBOOK
curr_dir = os.path.dirname(os.path.realpath(__file__))
SENTIMENTS_DIR = os.path.abspath(os.path.join(curr_dir, '..', "sentiments"))
if not SENTIMENTS_DIR in sys.path : sys.path.append(SENTIMENTS_DIR)

import google_sentiments as gsent

MAX_ELEMS = 10

def get_facebook_site(name : str, driver: uc.Chrome) -> Optional[str]:
    # get name of place, return optional string
    driver.get("https://www.google.com")
    wait = WebDriverWait(driver, 15)
    search_box = wait.until(EC.presence_of_element_located((By.ID, "APjFqb")))
    driver.execute_script("arguments[0].click();", search_box)
    search_box.send_keys(f"{name} site:facebook.com")
    search_box.send_keys(u'\ue007')
    #        //*[@id="rso"]/div[1]/div/div/div[1]/div/div[2]/div/div/span/a
    xpath = "//*[@id='rso']/div[1]/div/div/div[1]/div/div[2]/div/div/span/a"

    site_name = None
    try:
        reviews_button = WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.XPATH, xpath)))
        site_name = reviews_button.get_attribute("href")
        # return site_name
        
    except TimeoutException:
        print("Failed to find website", file=stderr)
        exit(1)
    
    driver.get(site_name)
    wait = WebDriverWait(driver, 15)    

    # Wait for the search box to be present and input the address
    close_box = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@aria-label="Close"]')))
    driver.execute_script("arguments[0].click();", close_box)
    review_score_xpath = '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[4]/div[2]/div/div[1]/div[2]/div/div[1]/div/div/div/div/div[2]/div[2]/div/ul/div[9]/div[2]/a/div/div/span'
    review_score_box = wait.until(EC.presence_of_element_located((By.XPATH, review_score_xpath)))
    overall_score_fb = float(re.search(r"(\d+)\%.*", review_score_box.text).group(1))/100 * 5

    driver.get(f"{site_name}reviews")
    close_box = wait.until(EC.element_to_be_clickable((By.XPATH, '//*[@aria-label="Close"]')))
    driver.execute_script("arguments[0].click();", close_box)  
    
    # I hate this website
    driver.execute_script("a = document.querySelector('html'); a.scrollTop = 0.45*a.scrollHeight; a.scrollTop = 0.45*a.scrollHeight;")
    reviews = []
    for n in range(1, 20):
        try:
            reviews_xpath = f"/html/body/div[1]/div/div[1]/div/div[3]/div/div/div[1]/div[1]/div/div/div[4]/div/div/div/div[{n}]/div/div/div/div/div/div/div/div/div/div[2]/div/div/div[3]/div[1]/div/div/div/div/span/div"
            review_data = WebDriverWait(driver, 1).until(EC.presence_of_element_located((By.XPATH, reviews_xpath)))
            reviews.append(review_data.text)
          
            
        except: pass
    reviews_dict = {
                "reviews" : reviews,
                "text_avg_rating" : overall_score_fb,
                "overall_avg_rating" : overall_score_fb
            }
    
    reviews_with_sentiments = gsent.sentims(reviews_dict)
    
    print(json.dumps(reviews_with_sentiments))

    



def main(argv):
    # Set up headless browser options
    options = webdriver.ChromeOptions()
    options.page_load_strategy = "eager"
    # options.add_experimental_option(
    # "prefs", {"profile.managed_default_content_settings.images": 2}
    # )
    options.add_argument("--headless=new")
    # preferences = {
    # "profile.managed_default_content_settings.images": 2,
    # "profile.default_content_settings.images": 2
    # }
    
    options.add_argument(f'--disk-cache-dir={os.path.dirname(os.path.realpath(__file__))}')
    # options.add_argument("--window-size=0,0")
    # remove devtools listening
    # options.add_experimental_option('excludeSwitches', ['enable-logging'])
    # options.add_experimental_option("prefs", preferences)
    driver = ourChrome(
        use_subprocess=False,
        headless=True,
        version_main=112
        )
    # driver = webdriver.Chrome(options=options)
    # print(f"\033[31;1;{argv[1]}\033[0m", file=stderr)
   
    get_facebook_site(argv[1], driver)
    
            #    get_reviews_by_address(linkname, driver)
    
    # payload = get_reviews_by_address(argv[1], driver)

    # print(json.dumps(payload))

if __name__ == "__main__":
    try:
        main(argv)
    except:
        print(json.dumps({
            "reviews" : [],
            "text_avg_rating" : 0,
            "overall_avg_rating" : 0,
            "sentiments" : {},
        }))