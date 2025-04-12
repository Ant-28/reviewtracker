from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from sys import argv
import undetected_chromedriver as uc


def get_reviews_by_address(address: str, driver: uc.Chrome) -> dict:
    """
    Function to scrape TripAdvisor reviews by address.
    """
    driver.get("https://www.tripadvisor.com/")
    wait = WebDriverWait(driver, 15)

    # Set window width to 700px to hide sideabr
    window_size = driver.execute_script("""
        return [window.outerWidth - window.innerWidth + arguments[0],
          window.outerHeight - window.innerHeight + arguments[1]];
        """, 700, 700)
    driver.set_window_size(*window_size)

    # Wait for the search box to be present and input the address
    search_box = wait.until(EC.presence_of_element_located(
        (By.XPATH, '//input[@type="search" and @aria-label="Search" and @role="searchbox"]')
    ))
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable(search_box))
    search_box.click()
    print(search_box)
    search_box.send_keys(address)

    # Press Enter to search
    search_box.send_keys(u'\ue007')

    # Click on the first result
    first_result = wait.until(EC.presence_of_element_located((By.XPATH, '//a[@class="BMQDV _F Gv wSSLS SwZTJ FGwzt ukgoS"]')))
    first_result.click()

    # Wait for the reviews button to be clickable and click it
    # xpath = '//div[contains(text(), "Reviews")]'

    # try:
    #     reviews_button = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
    #     reviews_button.click()
    # except TimeoutException:
    #     print("Failed to find reviews button")
    #     return

    # TODO: this does not click "Read More" to load full reviews.

    # Scroll to load reviews
    review_div_class = "fIrGe _T bgMZj"
    for _ in range(5):
        try:
            scrollable_element = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, f"//div[@class='{review_div_class}']"))
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

    # see_more_button = driver.find_elements(By.XPATH, './/button[@aria-label="See more"]')
    # for button in see_more_button:
    #     try:
    #         button.click()
    #     except Exception as e:
    #         pass

    print(len(reviews))
    return {
        "reviews": [review.text for review in reviews],
    }

def main(argv):
    # Set up emulated browser options
    driver = uc.Chrome(
        # headless=True,
        use_subprocess=False
    )
    payload = get_reviews_by_address(argv[1], driver)

    print(payload)

if __name__ == "__main__":
    main(argv)
