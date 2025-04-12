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