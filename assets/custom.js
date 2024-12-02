
var x = document.getElementById("Search-In-Header");

x.addEventListener("focus", function(e) {
    document.getElementById("modalOverlay").classList.add("modal-on");
});

x.addEventListener("focusout", function(e) {
    document.getElementById("modalOverlay").classList.remove("modal-on");
});
