document.addEventListener("DOMContentLoaded", function () {
    let audio = document.querySelector("audio");
    audio.play().catch(() => console.log("Autoplay blocked."));

    startCountdown();
});

function startCountdown() {
    const eventDate = new Date("February 11, 2025 00:00:00").getTime();
    
    setInterval(() => {
        const now = new Date().getTime();
        const distance = eventDate - now;

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        document.getElementById("countdown").innerHTML = `Birthday in: ${days} days ${hours} hours`;
    }, 1000);
}

startCountdown();
