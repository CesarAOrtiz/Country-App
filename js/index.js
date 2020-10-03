window.onload = () => {
    callAPI();
    document.querySelector("form").addEventListener("submit", search, false);
    document.querySelector("#search").addEventListener("click", search, false);
};

window.onresize = gridLayout;

var components;
var position;

async function callAPI() {
    try {
        const response = await fetch("https://restcountries.eu/rest/v2/all");
        const data = await response.json();
        await showComponents(data);
        gridLayout();
        getRegions(data);
        components = document.querySelectorAll(".block");
    } catch (error) {
        console.log(error);
    }
}

async function showComponents(object) {
    html = object.map((element) => createComponents(element, object)).join("");
    document.querySelector("#container").innerHTML = html;

    function createComponents(element, object) {
        let borders = object
            .filter((obj) => element.borders.includes(obj.alpha3Code))
            .map((obj) => {
                if (obj) {
                    return `<span onclick='showDetails(this, false)' data-name='${obj.name}'>${obj.name}</span>`;
                }
            })
            .join("");

        let dataset = `
        data-name="${element.name}" 
        data-flag="${element.flag}" 
        data-capital="${element.capital}"
        data-region="${element.region}" 
        data-subregion="${element.subregion}"
        data-languages="${[...element.languages.map((lan) => lan.name)]}" 
        data-population="${element.population.toLocaleString("es-MX")}" 
        data-currencies="${[...element.currencies.map((cur) => cur.name)]}"
        data-borders="${borders}"`;

        html = `
        <div id="${
            element.name
        }" class="block" onclick="showDetails(this, true)" ${dataset}>
            <div><img src="${element.flag}" alt="Flag"></div>
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

function getRegions(data) {
    let regions = [...new Set(data.map((element) => element.region))];
    let subregions = [...new Set(data.map((element) => element.subregion))];

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

function filterRegion(e) {
    let option = e.target.options[e.target.selectedIndex].value;
    let coincidense = new Array(...components)
        .filter(
            (obj) =>
                obj.dataset.region.includes(option) ||
                obj.dataset.subregion.includes(option)
        )
        .map((obj) => obj.dataset.name);

    components.forEach((object) => {
        if (coincidense.includes(object.dataset.name)) {
            object.style.display = "block";
        } else {
            object.style.display = "none";
        }
    });
}

function changeMode() {
    let body = document.querySelector("body");
    let bgColor = window.getComputedStyle(body).backgroundColor;
    if (bgColor === "rgb(224, 224, 224)") {
        body.style.setProperty("--bgc", "rgb(32, 44, 55)");
        body.style.setProperty("--ebg", "hsl(209, 23%, 22%)");
        body.style.setProperty("--lc", "hsl(0, 0%, 100%)");
        body.style.setProperty("--fbg", "hsl(208, 11%, 26%)");
    }
    if (bgColor === "rgb(32, 44, 55)") {
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
        if (object.dataset.name.toLowerCase().includes(search)) {
            object.style.display = "block";
        } else {
            object.style.display = "none";
        }
    });

    window.scroll(0, 0);
}

function showDetails(country, scroll = true) {
    let element = new Array(...components).find(
        (object) => object.dataset.name === country.dataset.name
    ).dataset;

    createDetails(element);

    if (scroll) {
        position = window.scrollY;
    }
    window.scroll(0, 0);

    document.querySelector("#section-form").style.display = "none";
    document.querySelector("#main-content").style.display = "none";
    document.querySelector("#detail-content").style.display = "block";

    function createDetails(element) {
        document.querySelector("#details").innerHTML = `
    <div id="back" onclick="back()">Back</div>
    <div id="flex-details">
        <div id="img">
            <img src="${element.flag}" alt="Flag of ${element.name}">
        </div>
        <div id="container-data">
            <p>${element.name}</p>
            <div id="data">
                <ul>
                    <li><span>Capital:</span> ${element.capital}</li>
                    <li><span>Region:</span> ${element.region}</li>
                    <li><span>Sub Region:</span> ${element.subregion}</li>
                </ul>
                <ul>
                    <li><span>Language:</span> ${element.languages}</li>
                    <li><span>Population:</span> ${element.population.toLocaleString(
                        "es-MX"
                    )}</li>
                    <li><span>Currencies:</span> ${element.currencies}</li>
                </ul>
            </div>
            <ul id="borders">
                <li>Borders: ${element.borders}</li>
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
    gridLayout();
}
