window.addEventListener("load", callAPI, false);

window.onresize = gridLayout;

var countries;
var components;
var position;

async function callAPI() {
    try {
        const response = await fetch("https://restcountries.eu/rest/v2/all", {
            cache: "default",
        });
        const data = await response.json();
        await show(data);
        gridLayout();
        countries = data;
        components = document.querySelectorAll(".block");
        getRegions();
        document
            .querySelector("form")
            .addEventListener("submit", search, false);
        document
            .querySelector("#search")
            .addEventListener("click", search, false);
    } catch (error) {
        console.log(error);
    }
}

async function show(object) {
    html = object.map((element) => createComponents(element)).join("");
    document.getElementById("container").innerHTML = html;

    function createComponents(element) {
        html = `
        <div id="${element.name}" class="block" onclick="showDetails(this)">
            <div><img width=220px height=150px src="${
                element.flag
            }" alt="Flag"></div>
            <ul>
                <li>${element.name}</li>
                <li>Capital: ${element.capital}</li>
                <li>Region: ${element.region}</li>
                <li>Population: ${element.population.toLocaleString(
                    "es-MX"
                )}</li>
            </ul>
        </div>`;
        return html;
    }
}

async function getRegions() {
    let regions = [...new Set(countries.map((element) => element.region))];
    let subregions = [
        ...new Set(countries.map((element) => element.subregion)),
    ];

    setRegion(regions, "region");
    setRegion(subregions, "subregion");

    document
        .querySelector("select")
        .addEventListener("change", filterRegion, false);

    function setRegion(regions, optgroup) {
        let html = regions
            .map((element) => {
                if (element) {
                    return `<option value="${element}">${element}</option>`;
                }
            })
            .join("");
        document.getElementById(optgroup).innerHTML = html;
    }
}

async function gridLayout() {
    let section = document.getElementById("main-content");
    let grid = document.getElementById("container");
    let cell = document.querySelector(".block");
    let cellMargin = parseInt(window.getComputedStyle(cell).margin);
    let space = parseInt(
        section.clientWidth / ((cell.offsetWidth || 220) + cellMargin)
    );
    grid.style.gridTemplateColumns = `repeat(${space}, 1fr)`;
}

function changeMode() {
    let body = document.querySelector("body");
    let bgColor = window.getComputedStyle(body).backgroundColor;
    if (bgColor == "rgb(224, 224, 224)") {
        body.style.setProperty("--bgc", "rgb(32, 44, 55)");
        body.style.setProperty("--ebg", "hsl(209, 23%, 22%)");
        body.style.setProperty("--lc", "hsl(0, 0%, 100%)");
        body.style.setProperty("--fbg", "hsl(208, 11%, 26%)");
    }
    if (bgColor == "rgb(32, 44, 55)") {
        body.style.setProperty("--bgc", "rgb(224, 224, 224)");
        body.style.setProperty("--ebg", "hsl(0, 0%, 100%)");
        body.style.setProperty("--lc", "hsl(200, 15%, 8%)");
        body.style.setProperty("--fbg", "rgb(240, 240, 240)");
    }
}

function search(e) {
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
    window.scroll(0, 0);
}

function filterRegion(e) {
    let option = e.target.options[e.target.selectedIndex].value;
    let coincidense = countries.filter(
        (obj) => obj.region.includes(option) || obj.subregion.includes(option)
    );
    let results = coincidense.map((obj) => obj.name);

    components.forEach((object) => {
        if (results.includes(object.id)) {
            object.style.display = "block";
        } else {
            object.style.display = "none";
        }
    });
}

function showDetails(country, scroll = true) {
    let select = countries.filter((obj) => obj.name == country.id);
    let element = select[0];

    let border = countries.filter((obj) =>
        element.borders.includes(obj.alpha3Code)
    );
    let borderName = border.map((obj) => obj.name);
    let borders = "";
    borderName.forEach(
        (obj) =>
            (borders += `<span onclick="showDetails(this, false)" id="${obj}">${obj}</span>`)
    );

    createDetails(element, borders);

    if (scroll) {
        position = window.scrollY;
    }
    window.scroll(0, 0);
    document.querySelector("#section-form").style.display = "none";
    document.querySelector("#main-content").style.display = "none";
    document.querySelector("#detail-content").style.display = "block";

    function createDetails(element, borders) {
        document.querySelector("#details").innerHTML = `
    <div id="back" onclick="back()">Back</div>
    <div id="flex-details">
        <div id="img"><img src="${element.flag}" alt="Flag of ${
            element.name
        }"></div>
        <div id="container-data">
            <p>${element.name}</p>
            <div id="data">
                <ul>
                    <li><span>Capital:</span> ${element.capital}</li>
                    <li><span>Region:</span> ${element.region}</li>
                    <li><span>Sub Region:</span> ${element.subregion}</li>
                </ul>
                <ul>
                    <li><span>Language:</span> ${[
                        ...element.languages.map((lan) => lan.name),
                    ]}</li>
                    <li><span>Population:</span> ${element.population.toLocaleString(
                        "es-MX"
                    )}</li>
                    <li><span>Currencies:</span> ${[
                        ...element.currencies.map((cur) => cur.name),
                    ]}</li>
                </ul>
            </div>
            <ul id="borders">
                <li>Borders: ${borders}</li>
            </ul>
        </div>
    </div>`;
    }
}

function back() {
    document.querySelector("#detail-content").style.display = "none";
    document.querySelector("#section-form").style.display = "flex";
    document.querySelector("#main-content").style.display = "flex";
    window.scroll(0, position);
}
