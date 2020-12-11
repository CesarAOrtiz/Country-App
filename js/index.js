window.onload = () => {
    getMedia();
    callAPI();
};

document.querySelector("#mode").addEventListener("click", toggleMode, false);
document.querySelector("#form").addEventListener("submit", search, false);
document.querySelector("#search").addEventListener("click", search, false);
document.querySelector("#filter").addEventListener("change", filter, false);
window.addEventListener("resize", gridLayout, false);

var countries;
var scrollPosition;

function getMedia() {
    const media = window.matchMedia(
        "(prefers-color-scheme: light), (prefers-color-scheme: no-preference)"
    );
    if (media.matches) {
        document.body.classList.add("light-theme");
    } else {
        document.body.classList.add("dark-theme");
    }
    getMode();
}

function getMode() {
    let mode = document.querySelector("#mode");
    if (document.body.className === "dark-theme") {
        mode.innerHTML = "Light Mode";
    } else {
        mode.innerHTML = "Dark Mode";
    }
}

async function toggleMode() {
    document.body.classList.toggle("dark-theme");
    document.body.classList.toggle("light-theme");
    getMode();
}

async function callAPI() {
    try {
        const response = await fetch(
            "https://restcountries.eu/rest/v2/all?fields=name;capital;currencies;alpha3Code;region;subregion;flag;population;borders;languages"
        );
        const data = await response.json();
        showCards(data);
        showRegions(data);
        gridLayout();
        countries = data;
    } catch (error) {
        console.log(error);
    }
}

function showCards(data) {
    document.querySelector("#container").innerHTML = createCards(data);

    function createCards(object) {
        let html = object
            .map(
                (element) => `
                    <div id="${
                        element.name
                    }" class="card" onclick="showDetails(this, true)">
                        <img width=220px hieght=150px src="${
                            element.flag
                        }" alt="Flag">
                        <ul>
                            <li><span>${element.name}</span></li>
                            <li><span>Capital:</span> ${element.capital}</li>
                            <li><span>Region:</span> ${element.region}</li>
                            <li><span>Population:</span> ${element.population.toLocaleString(
                                "es-MX"
                            )}</li>
                        </ul>
                    </div>`
            )
            .join("");

        return html;
    }
}

function showRegions(data) {
    document.querySelector("#filter").innerHTML = creatRegion(data);

    function creatRegion(data) {
        let region = [...new Set(data.map((element) => element.region))];
        let subregion = [...new Set(data.map((element) => element.subregion))];
        let regions = region.concat(subregion).sort();

        let html = `<option value="">All</option>`;
        regions.forEach((element) => {
            if (element) {
                html += `<option value="${element}">${element}</option>`;
            }
        });

        return html;
    }
}

function gridLayout() {
    let section = document.querySelector("#main-content");
    let grid = document.querySelector("#container");
    let cell = document.querySelector(".card");
    let cellMargin = parseInt(window.getComputedStyle(cell).margin);
    let space = parseInt(
        section.clientWidth /
            (parseInt(window.getComputedStyle(cell).width) + cellMargin)
    );
    grid.style.gridTemplateColumns = `repeat(${space}, 1fr)`;
}

function search(e) {
    e.preventDefault();

    const search = document
        .querySelector("#search-field")
        .value.toLowerCase()
        .trim();
    const coincidense = countries.filter((object) =>
        object.name.toLowerCase().includes(search)
    );
    showCards(coincidense);

    window.scroll(0, 0);
}

function filter(e) {
    const option = e.target.options[e.target.selectedIndex].value;
    const coincidense = countries.filter(
        (obj) => obj.region.includes(option) || obj.subregion.includes(option)
    );
    showCards(coincidense);

    window.scroll(0, 0);
}

function showDetails(country, scroll = true) {
    const element = countries.find((obj) => obj.name === country.id);
    const borders = countries.filter((obj) =>
        element.borders.includes(obj.alpha3Code)
    );
    let borderNames = "";
    borders.forEach(
        (obj) =>
            (borderNames += `<span onclick="showDetails(this, false)" id="${obj.name}" class="border">${obj.name}</span>`)
    );

    document.querySelector("#detail-content").innerHTML = createDetails(
        element,
        borderNames
    );

    if (scroll) {
        scrollPosition = window.scrollY;
    }

    window.scroll(0, 0);

    document.querySelector("#section-form").style.display = "none";
    document.querySelector("#main-content").style.display = "none";
    document.querySelector("#detail-content").style.display = "block";

    function createDetails(element, borders) {
        return `
    <div id="back" onclick="back()">Back</div>
    <div id="flex-details">
        <img width=486px  height=324px src="${element.flag}" alt="Flag of ${
            element.name
        }">
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
    window.scroll(0, scrollPosition);
    gridLayout();
}
