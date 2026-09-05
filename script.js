/* =========================
   CINEMATIC INTRO
========================= */

const intro = document.getElementById("intro");
const birthday = document.getElementById("birthday");
const introLines = document.querySelectorAll(".introLine");

let currentLine = 0;


function showLine(index) {

    introLines.forEach((line) => {

        line.style.opacity = "0";

        line.style.transform = "translateY(20px)";

    });


    if (index < introLines.length) {

        introLines[index].style.opacity = "1";

        introLines[index].style.transform = "translateY(0)";


        setTimeout(() => {

            showLine(index + 1);

        }, 2500);

    }

    else {

        setTimeout(() => {

            intro.style.opacity = "0";

            intro.style.pointerEvents = "none";


            birthday.style.opacity = "1";

            birthday.style.transform = "scale(1)";

        }, 1200);

    }

}


/* Start cinematic intro */

setTimeout(() => {

    showLine(0);

}, 1000);



/* =========================
   ENTER STORY
========================= */

function startStory() {

    const story = document.getElementById("story");

    story.scrollIntoView({
        behavior: "smooth"
    });

}
