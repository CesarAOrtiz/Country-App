window.addEventListener(
    "load",
    () => {
        callAPI();
        document
            .querySelector("form")
            .addEventListener("submit", showSearch, false);
        document
            .querySelector("#search")
            .addEventListener("click", showSearch, false);
    },
    false
);
window.onresize = gridLayout;
var countries;
var components;

async function callAPI() {
    try {
        const response = await fetch("https://restcountries.eu/rest/v2/all");
        const data = await response.json();
        await show(data);
        gridLayout();
        countries = data;
        components = document.querySelectorAll(".block");
    } catch (error) {
        console.log(error);
    }
}

async function show(object) {
    html = "";
    object.forEach((element) => {
        html += `
    <div id="${element.name}" class="block">
        <div><img src="${element.flag}" alt="Flag"></div>
        <ul>
            <li>${element.name}</li>
            <li>Capital: ${element.capital}</li>
            <li>Region: ${element.region}</li>
            <li>Population: ${element.population}</li>
        </ul>
    </div>`;
    });
    document.querySelector("#container").innerHTML = html;
}

function gridLayout() {
    let sec = document.querySelector("#main-content");
    let grid = document.querySelector("#container");
    let cell = document.querySelector(".block");
    let cellMargin = parseInt(window.getComputedStyle(cell).margin);
    let num = parseInt(
        sec.clientWidth / ((cell.offsetWidth || 220) + cellMargin)
    );
    grid.style.gridTemplateColumns = `repeat(${num}, 1fr)`;
}

function changeMode() {
    let body = document.querySelector("body");
    let bgColor = window.getComputedStyle(body).backgroundColor;
    console.log(window.getComputedStyle(body).backgroundColor);
    let colors = body.style;
    if (bgColor == "rgb(224, 224, 224)") {
        colors.setProperty("--bgc", "rgb(32, 44, 55)");
        colors.setProperty("--ebg", "hsl(209, 23%, 22%)");
        colors.setProperty("--lc", "hsl(0, 0%, 100%)");
    }
    if (bgColor == "rgb(32, 44, 55)") {
        colors.setProperty("--bgc", "rgb(224, 224, 224)");
        colors.setProperty("--ebg", "hsl(0, 0%, 100%)");
        colors.setProperty("--lc", "hsl(200, 15%, 8%)");
    }
}

function showSearch(e) {
    e.preventDefault();
    let search = document
        .querySelector("#search-field")
        .value.toLowerCase()
        .trim();
    components.forEach((object) => {
        if (object.id.toLowerCase().includes(search)) {
            object.style.display = "block";
        } else {
            object.style.display = "none";
        }
    });
    gridLayout();
}
