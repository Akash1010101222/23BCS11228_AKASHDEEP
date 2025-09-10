const textbox = document.getElementById("textbox");
const charCount = document.getElementById("charCount");

textbox.addEventListener("input", () => {
  charCount.textContent = textbox.value.length;
});
