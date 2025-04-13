## Inspiration

Review management is quite cumbersome for a plethora of business owners. Having interacted frequently with small businesses and startups, we are attuned to the need for valuable feedback and summaries.  With that in mind, we decided to design a review aggregator for small business, akin to Metacritic. 


## What it does

Our software collects reviews from Google Maps, Facebook and a multitude of other platforms. We combined deterministic scraping with more entropic LLM scraping using a GPT-4 powered AI agent via [Langflow](https://www.langflow.org/). 

We also provide an average sentiment analysis across reviews, displaying the frequency of the top 3 sentiments. 

## How we built it

The main driver was a set of webscrapers that collect reviews for businesses, tailored to each review website. These were written in Python using Selenium. We wrote a backend in Node.js and Express, which was the client's interface to the review data. The frontend was written in HTML and JS (Vanilla) with Pico CSS as a minimal stylesheet.

For the sentiment analysis, we used the [NRC](https://saifmohammad.com/WebPages/NRC-Emotion-Lexicon.htm), in addition to Langflow's LLM features. 

## Challenges we ran into (and how we solved them)

Our first challenge involved *consistent loading* and preventing our client from being flagged as a spambot. We addressed this by using an "undectectable" driver. 

<!-- reword! -->
Since we were collecting reviews from multiple sources, we had to combine our review data with our sentiment analysis corpus.  

Furthermore, when using LLMs to aggregate reviews, their reliability varied significantly depending on the model used. Notably, `Gemini 2.0-pro-exp` sometimes found fewer reviews or threw errors, while `GPT 4o-mini` was more consistent as it is a production-ready LLM.



## Accomplishments that we're proud of

To begin with, 2/3rds of our team have never participated in a hackathon, so this has been a very enlightening experience. 

Additionally, we are proud of writing decent webscrapers and handling multiple failure states, ensuring all failures are as graceful as possible. 

<!-- reword! -->
Lastly, collating all of this data over a span of 2 days is a daunting task that we successfully tackled.

## What we learned

Firstly, we prioritized software *performance* over *aesthetics*. In other words: "get it running!". 

We also discussed approaches frequently, especially when ideas weren't working. This allowed to pivot our design and implementation to match our goals more closely. 

Since we initially planned to use APIs, we learnt to leverage webscraping as a contingency whenever possible. 


## What's next for Review Raven

We aim to expand its scope to provide more detailed sentiment analyses and reviews. We would also let business owners create accounts and make notes on their businessess for further review or view their performance over time as graphs. Finally, our long-term goal is to expand this to a service/API that other businesses (as well as students) can use affordably.
