const slides = document.querySelector('.slides');
const images = document.querySelectorAll('.slides img');
let index = 0;

function showSlide() {
    index = (index + 1) % images.length; // Cycle through images
    slides.style.transform = `translateX(-${index * 100}%)`;
}

setInterval(showSlide, 4000); // Adjust timing for smoother transitions
