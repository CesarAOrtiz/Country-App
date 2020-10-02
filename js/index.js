window.addEventListener(
    "load",
    () => {
        callAPI();
        document
            .querySelector("form")
            .addEventListener("submit", search, false);
        document
            .querySelector("#search")
            .addEventListener("click", search, false);
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
        getRegions();
    } catch (error) {
        console.log(error);
    }
}

async function show(object) {
    html = "";
    object.forEach((element) => {
        html += `
    <div id="${element.name}" class="block" onclick="showDetails(this)">
        <div><img src="${element.flag}" alt="Flag"></div>
        <ul>
            <li>${element.name}</li>
            <li>Capital: ${element.capital}</li>
            <li>Region: ${element.region}</li>
            <li>Population: ${element.population.toLocaleString("es-MX")}</li>
        </ul>
    </div>`;
    });
    document.querySelector("#container").innerHTML = html;
}

function gridLayout() {
    let section = document.querySelector("#main-content");
    let grid = document.querySelector("#container");
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
    }
    if (bgColor == "rgb(32, 44, 55)") {
        body.style.setProperty("--bgc", "rgb(224, 224, 224)");
        body.style.setProperty("--ebg", "hsl(0, 0%, 100%)");
        body.style.setProperty("--lc", "hsl(200, 15%, 8%)");
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
}

function getRegions() {
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
        let html = "";
        regions.forEach((element) => {
            if (element) {
                html += `
                <option value="${element}">${element}</option>`;
            }
        });
        document.getElementById(optgroup).innerHTML = html;
    }
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

function showDetails(country) {
    let select = countries.filter((obj) => obj.name == country.id);
    let element = select[0];
    html = `
    <div id="back" onclick="back()">Back</div>
    <div id="flex-details">
        <div id="img"><img src="${element.flag}" alt="Flag"></div>
        <div id="container-data">
            <p>${element.name}</p>
            <div id="data">
                <ul>
                    <li><span>Capital:</span> ${element.capital}</li>
                    <li><span>Region:</span> ${element.region}</li>
                    <li><span>Sub Region:</span> ${element.subregion}</li>
                </ul>
                <ul>
                    <li><span>Currencies:</span> ${[
                        ...element.currencies.map((cur) => cur.name),
                    ]}</li>
                    <li><span>Population:</span> ${element.population.toLocaleString(
                        "es-MX"
                    )}</li>
                    <li><span>Language:</span> ${[
                        ...element.languages.map((lan) => lan.name),
                    ]}</li>
                </ul>
            </div>
        </div>
    </div>`;
    //<li><span>Borders:</span> ${[...element.borders]}</li>
    document.querySelector("#details").innerHTML = html;
    document.querySelector("#section-form").style.display = "none";
    document.querySelector("#main-content").style.display = "none";
    document.querySelector("#detail-content").style.display = "block";
}

function back() {
    document.querySelector("#detail-content").style.display = "none";
    document.querySelector("#section-form").style.display = "flex";
    document.querySelector("#main-content").style.display = "flex";
    gridLayout();
}
