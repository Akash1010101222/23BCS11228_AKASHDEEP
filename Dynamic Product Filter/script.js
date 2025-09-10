const dropdown = document.getElementById("category");
const products = document.querySelectorAll(".product");

dropdown.addEventListener("change", () => {
  const selected = dropdown.value;

  products.forEach(product => {
    if (selected === "all" || product.dataset.category === selected) {
      product.style.display = "block";
    } else {
      product.style.display = "none";
    }
  });
});
