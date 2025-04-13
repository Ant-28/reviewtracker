// const require = NodeJS.require
require("dotenv").config();
const { exec } = require("node:child_process");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText";
const GOOGLE_API_KEY = process.env.GOOG_PLACES_APIKEY;

app.use(express.static("frontend"));
app.use(express.json());

app.get("/locations/", async (req, res) => {
  let q = req.query;
  try {
    const search_text = await fetch(`${GOOGLE_TEXT_SEARCH}`, {
      method: "POST",
      body: JSON.stringify({ textQuery: q.searchText }),
      headers: {
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress",
      },
    });
    const search_json = await search_text.json();
    if (!search_json.places) {
      res.status(404).send();
    }
    console.log(search_json.places[0].formattedAddress);
    console.log("dishplay name"); // sean connery
    console.log(search_json.places[0].displayName);
    const newRes = search_json.places.map((obj) => {
      return {
        faddr: obj.formattedAddress,
        fname: obj.displayName.text,
      };
    });
    res.status(200).send(newRes.slice(0, 10));
  } catch (error) {
    console.error(error);
    res.status(500).send();
  }

});

function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve({ stdout, stderr });
    });
  });
}

// /reviews/?addrText=...
app.post("/reviews/", async (req, res) => {
  const q = req.body;

  const langflow_payload = {
    "input_value": `${q.fname} ${q.faddr}`,
    "output_type": "chat",
    "input_type": "chat"
  };
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(langflow_payload)
  };

  const langflowPromise = fetch('http://127.0.0.1:7860/api/v1/run/01b79eb9-710c-4d6c-ad1b-cb83f245d67c', options)
    .then(response => response.json())
    .then(response => {
      // Pull JSON block out of llm response
      const codeblock_response = response["outputs"][0]["outputs"][0]["results"]["message"]["text"];
      // Strip out leading ```json\n and trailing \n```
      const json_string = codeblock_response.substring(8, codeblock_response.length - 3);
      const json_obj = JSON.parse(json_string);

      const allReviews = json_obj.flatMap(source => 
        source.reviews.map(r => r.review)
      );
      console.log("ALL REVIEWS", allReviews);
      return allReviews;
    });

  const execPromise = execAsync(`"python3" scraper/google_reviews.py "${q.fname} ${q.faddr}"`)
    .then(({ stdout }) => JSON.parse(stdout));

  const execPromiseFB = execAsync(`"python3" scraper/facebook_reviews.py "${q.fname} ${q.faddr}"`)
    .then(({ stdout }) => JSON.parse(stdout));

  // Run both langflow fetch and google scraper in parallel. and facebook scraper
  try {
    const [langflowResponse, googleResponse, fbResponse] =
      await Promise.allSettled([langflowPromise, execPromise, execPromiseFB]);

    // Send back an object including keys for all three sources.
    // If any promise was rejected, that key's value will be empty object in response.
    res.status(200).json({
      llmReviews: langflowResponse.status === "fulfilled" ? langflowResponse.value : [],
      googleReviews: googleResponse.status === "fulfilled" ? googleResponse.value : {},
      fbReviews: fbResponse.status === "fulfilled" ? fbResponse.value : {}
    });

  } catch (error) {
    console.error(error);
    res.status(500).send();
  }

});

app.listen(PORT, () => {
  console.log(`Testing on port ${PORT}`);
});
