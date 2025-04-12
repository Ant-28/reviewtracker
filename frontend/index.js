const reviews = [
  [
    "I am a Google review",
    "Cool place."
  ],
  [
    "Here is a Yelp review",
    "Best ice cream in the state"
  ],
  [
    "Facebook review here",
    "my grandkids love this place"
  ]
];

// Wait till full page loads to run script
document.addEventListener("DOMContentLoaded", () => {
  // Populate Google reviews into DOM
  const col1 = document.getElementById("col1");
  reviews[0].forEach(review => {
    const article = document.createElement("article");
    article.textContent = review;
    col1.appendChild(article);
  });
  // Populate Yelp reviews into DOM
  const col2 = document.getElementById("col2");
  reviews[1].forEach(review => {
    const article = document.createElement("article");
    article.textContent = review;
    col2.appendChild(article);
  });
  // Populate Facebook reviews into DOM
  const col3 = document.getElementById("col3");
  reviews[2].forEach(review => {
    const article = document.createElement("article");
    article.textContent = review;
    col3.appendChild(article);
  });
});

// Handler for search box: send text query, receive places,
// display options in table with accept buttons
document.getElementById("search").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    const query = e.target.value;
    // Clear text box
    e.target.value = "";

    const params = new URLSearchParams();
    params.append("searchText", query);
    const response = await fetch(`/locations?${params}`);
    if (response.status === 404) {
      // No places found.
      document.getElementById('business-name').textContent = "No places found...";
    }

    // At least 1 place found.
    const data = await response.json();
    const table = document.getElementById("results");
    table.style.display = "block";
    // Clear existing rows in the table
    table.innerHTML = "";

    // Populate table with places
    data.forEach(place => {
      const row = document.createElement("tr");

      // Name column
      const nameCell = document.createElement("td");
      nameCell.textContent = place.fname;
      row.appendChild(nameCell);

      // Address column
      const addressCell = document.createElement("td");
      addressCell.textContent = place.faddr;
      row.appendChild(addressCell);

      // Button column
      const buttonCell = document.createElement("td");
      const selectButton = document.createElement("button");
      selectButton.textContent = "Select";
      // Add event listener to the button
      selectButton.addEventListener("click", () => handleButtonClick(place));

      buttonCell.appendChild(selectButton);
      row.appendChild(buttonCell);

      table.appendChild(row);
    });
  }
});

// Function to handle button click
async function handleButtonClick(place) {
  
  try {
    const response = await fetch("/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(place)
    });

    // TODO: handle response
    console.log(response);
  } catch (error) {
    console.error("Error:", error);
  }
}