const reviews = [
  [
    "..."
  ],
  [
    "..."
  ]
];

const emojiMap = {
  'anger': '😡',
  'anticipation': '👀',
  'disgust': '🤢',
  'fear': '😨',
  'joy': '😂',
  'sadness': '☹️',
  'surprise': '🤯',
  'trust': '🤝'
}

// Wait till full page loads to run script
document.addEventListener("DOMContentLoaded", () => {
  // Populate Google reviews into DOM
  const col1 = document.getElementById("col1");
  reviews[0].forEach(review => {
    const article = document.createElement("article");
    article.textContent = review;
    col1.appendChild(article);
  });
  // Populate all other reviews into DOM
  const col2 = document.getElementById("col2");
  reviews[1].forEach(review => {
    const article = document.createElement("article");
    article.textContent = review;
    col2.appendChild(article);
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
  document.getElementById('business-name').textContent = `${place.fname} -- ${place.faddr}`;
  // Hide the table
  document.getElementById("results").style.display = "none";
  // Show indeterminate progress bar
  document.getElementById("indeterminate").style.display = "block";

  try {
    const response = await fetch("/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(place)
    });
    const data = await response.json();
    const {llmReviews, googleReviews, fbReviews} = data;

    // Hide progress bar
    document.getElementById("indeterminate").style.display = "none";

    // Populate Google reviews into page
    const col1 = document.getElementById("col1");
    col1.innerHTML = ""; // Clear existing reviews
    googleReviews.reviews?.forEach(review => {
      const article = document.createElement("article");
      article.textContent = review;
      col1.appendChild(article);
    });

    // Populate LLM reviews into Other column
    const col2 = document.getElementById("col2");
    col2.innerHTML = ""; // Clear existing reviews
    llmReviews.forEach(review => {
      const article = document.createElement("article");
      article.textContent = review;
      col2.appendChild(article);
    });

    // Populate Facebook reviews into col3
    const col3 = document.getElementById("col3");
    col3.innerHTML = ""; // Clear existing reviews
    fbReviews.reviews.forEach(review => {
      const article = document.createElement("article");
      article.textContent = review;
      col3.appendChild(article);
    });

    // Populate overall rating amount and subtitle
    document.getElementById('google-progress').value = googleReviews.overall_avg_rating;
    document.getElementById('google-subtitle').textContent = `Google rating: ${googleReviews.overall_avg_rating} ★`;
    document.getElementById('facebook-progress').value = fbReviews.overall_avg_rating;
    document.getElementById('facebook-subtitle').textContent = `Facebook rating: ${fbReviews.overall_avg_rating} ★`;

    // Show sentiment on page.
    // Extract top 3 sentiments
    const topSentiments = Object.entries(googleReviews.sentiments)
      .sort(([, a], [, b]) => b - a) // Sort by float values in descending order
      .slice(0, 3) // Take the top 3
      .map(([key]) => key); // Extract the keys
    // Display the top 3 sentiments
    document.getElementById("sentiment").textContent = `Top sentiments: \r\n
      ${emojiMap[topSentiments[0]]} ${topSentiments[0]} (${(googleReviews.sentiments[topSentiments[0]] * 100).toFixed(2)}%) \r\n
      ${emojiMap[topSentiments[1]]} ${topSentiments[1]} (${(googleReviews.sentiments[topSentiments[1]] * 100).toFixed(2)}%) \r\n
      ${emojiMap[topSentiments[2]]} ${topSentiments[2]} (${(googleReviews.sentiments[topSentiments[2]] * 100).toFixed(2)}%)`;
  } catch (error) {
    console.error("Error:", error);
  }
}