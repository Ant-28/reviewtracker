// const require = NodeJS.require
const express = require("express");

const app     = express();
const PORT    = 3000;
const GOOGLE_TEXT_SEARCH = "https://places.googleapis.com/v1/places:";


app.get("/locations/", async (req, res) => {
    let q = req.query;
    try {
        const search_text = await fetch(`${GOOGLE_TEXT_SEARCH}${q.searchText}`, {method: "POST",});
        const search_json = await search_text.json();
        console.log(search_json);
    }
    catch (error){
        console.error(error);
    }

    res.end();
} );

app.listen(PORT, () => {
        console.log(`Testing on port ${PORT}`)
    });