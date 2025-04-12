// const require = NodeJS.require
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText";
const GOOGLE_API_KEY = process.env.GOOG_PLACES_APIKEY;

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
    if (Object.keys(search_json).length === 0) {
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
    res.status(200).send(newRes);
  } catch (error) {
    console.error(error);
  }
  
});

app.listen(PORT, () => {
  console.log(`Testing on port ${PORT}`);
});
