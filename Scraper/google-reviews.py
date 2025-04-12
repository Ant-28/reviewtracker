from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from sys import argv
import time
import os

def get_reviews_by_address(address, driver):
    """
    Function to scrape Google reviews by address.
    """
    driver.get("https://www.google.com/maps")
    wait = WebDriverWait(driver, 15)

    # Wait for the search box to be present and input the address
    search_box = wait.until(EC.presence_of_element_located((By.ID, "searchboxinput")))
    search_box.click()
    search_box.send_keys(address)

    # Press Enter to search
    search_box.send_keys(u'\ue007')

    # Wait for the reviews button to be clickable and click it
    xpath = '//div[contains(text(), "Reviews")]'
    try:
        reviews_button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
        reviews_button.click()
    except TimeoutException:
        print("Failed to find reviews button")
        return

    # Scroll to load reviews
    for xpath in [
    '//*[@id="QA0Szd"]/div/div/div[1]/div[2]/div/div[1]/div/div/div[4]',
    '//*[@id="QA0Szd"]/div/div/div[1]/div[2]/div/div[1]/div/div/div[2]'
    ]:
        try:
            scrollable_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, xpath))
            )
            # Extra check to ensure it's scrollable
            if driver.execute_script("return arguments[0].scrollHeight > arguments[0].clientHeight;", scrollable_element):
                break
        except:
            continue


    # Scroll whenever the height changes.
    previous_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)

    for _ in range(7):  # Scroll multiple times to load more reviews
        # Scroll to the bottom of the scrollable element
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", scrollable_element)

        # Wait for the scrollable element's height to increase
        WebDriverWait(driver, 2).until(
            lambda d: d.execute_script("return arguments[0].scrollHeight", scrollable_element) > previous_height
        )

        # Update the previous height for the next iteration
        previous_height = driver.execute_script("return arguments[0].scrollHeight", scrollable_element)

    # Fetch reviews
    reviews = scrollable_element.find_elements(By.XPATH, '//*[@class="MyEned"]')

    see_more_button = driver.find_elements(By.XPATH, './/button[@aria-label="See more"]')
    for button in see_more_button:
        try:
            button.click()
        except Exception as e:
            pass

    # find div with role img and aria-label that contains star

    star_div = driver.find_element(By.XPATH, '//div[@role="img" and @aria-label]')
    star_rating = star_div.get_attribute("aria-label")

    # all elements where aria label contains star
    star_elements = driver.find_elements(By.XPATH, '//span[@class="kvMYJc"]')

    stars = []

    for star in star_elements:
        rating = len(star.find_elements(By.XPATH, './/span[@class="hCCjke google-symbols NhBTye elGi1d"]'))
        stars.append(rating)

    average_rating = sum(stars[:len(reviews)]) / len(reviews)
    print(len(reviews))
    return {
        "reviews": [review.text for review in reviews],
        "text_avg_rating": round(average_rating, 2),
        "overall_avg_rating": float(star_rating.split(" ")[0]),
    }

def main(argv):
    # Set up headless browser options
    options = webdriver.ChromeOptions()
    options.page_load_strategy = "eager"
    # options.add_experimental_option(
    # "prefs", {"profile.managed_default_content_settings.images": 2}
    # )
    # options.add_argument("--headless")
    # preferences = {
    # "profile.managed_default_content_settings.images": 2,
    # "profile.default_content_settings.images": 2
    # }
    options.add_argument(f'--disk-cache-dir={os.path.dirname(os.path.realpath(__file__))}')
    # options.add_experimental_option("prefs", preferences)
    driver = webdriver.Chrome(options=options)
    payload = get_reviews_by_address(argv[1], driver)

    print(payload)

if __name__ == "__main__":
    main(argv)
