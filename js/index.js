window.onload = async () => {
    customElements.define("c-card", Card);
    await callAPI();
    components = Array.from(document.querySelectorAll("c-card"));
    document.querySelector("#form").addEventListener("submit", search, false);
    document.querySelector("#search").addEventListener("click", search, false);
    document.querySelector("#select").addEventListener("change", filter, false);
    document.querySelector("#mode").addEventListener("click", mode, false);
    window.addEventListener("resize", gridLayout, false);
};

var countries;
var components;
var position;

async function callAPI() {
    try {
        const response = await fetch("https://restcountries.eu/rest/v2/all");
        const data = await response.json();
        await show(data);
        gridLayout();
        showRegions(data);
        countries = data;
    } catch (error) {
        console.log(error);
    }
}

async function show(object) {
    let container = document.querySelector("#container");
    object.map((element) => {
        let card = document.createElement("c-card");
        container.appendChild(card);
        card.createCard(element);
    });
}

async function showRegions(data) {
    document.querySelector("#select").innerHTML = await creatRegion(data);

    async function creatRegion(data) {
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

async function gridLayout() {
    let section = document.querySelector("#main-content");
    let grid = document.querySelector("#container");
    let cell = document.querySelector("c-card");
    let cellMargin = parseInt(window.getComputedStyle(cell).margin);
    let space = parseInt(
        section.clientWidth /
            (parseInt(window.getComputedStyle(cell).width) + cellMargin)
    );
    grid.style.gridTemplateColumns = `repeat(${space}, 1fr)`;
}

async function mode() {
    let body = document.body;
    let bgColor = window.getComputedStyle(body).backgroundColor;
    let change = body.style;
    if (bgColor === "rgb(224, 224, 224)") {
        change.setProperty("--bgc", "rgb(32, 44, 55)");
        change.setProperty("--ebg", "hsl(209, 23%, 22%)");
        change.setProperty("--lc", "hsl(0, 0%, 100%)");
        change.setProperty("--fbg", "hsl(208, 11%, 26%)");
    }
    if (bgColor === "rgb(32, 44, 55)") {
        change.setProperty("--bgc", "rgb(224, 224, 224)");
        change.setProperty("--ebg", "hsl(0, 0%, 100%)");
        change.setProperty("--lc", "hsl(200, 15%, 8%)");
        change.setProperty("--fbg", "rgb(240, 240, 240)");
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

async function filter(e) {
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

async function showDetails(country, scroll = true) {
    let element = countries.find((obj) => obj.name === country.id);

    let border = countries.filter((obj) =>
        element.borders.includes(obj.alpha3Code)
    );
    let borderName = border.map((obj) => obj.name);
    let borders = "";
    borderName.forEach(
        (obj) =>
            (borders += `<span onclick="showDetails(this, false)" id="${obj}">${obj}</span>`)
    );

    document.querySelector("#details").innerHTML = await createDetails(
        element,
        borders
    );

    if (scroll) {
        position = window.scrollY;
    }
    window.scroll(0, 0);

    document.querySelector("#section-form").style.display = "none";
    document.querySelector("#main-content").style.display = "none";
    document.querySelector("#detail-content").style.display = "block";

    function createDetails(element, borders) {
        return `
    <div id="back" onclick="back()">&#x2b05;Back</div>
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

async function back() {
    document.querySelector("#detail-content").style.display = "none";
    document.querySelector("#section-form").style.display = "flex";
    document.querySelector("#main-content").style.display = "flex";
    window.scroll(0, position);
    gridLayout();
}

class Card extends HTMLElement {
    connectedCallback() {
        this.img = this.appendChild(document.createElement("img"));
        this.ul = this.appendChild(document.createElement("ul"));
        this.addEventListener("click", () => showDetails(this), false);
    }

    createCard(element) {
        this.id = element.name;
        this.img.width = "220";
        this.img.height = "150";
        this.img.src = element.flag;
        this.img.alt = `Flag of${element.name}`;
        this.addData(element.name);
        this.addData(element.capital, "Capital:");
        this.addData(element.region, "Region:");
        this.addData(element.population.toLocaleString("es-MX"), "Population:");
    }

    addData(text, label = "") {
        let li = document.createElement("li");
        li.textContent = `${label} ${text}`;
        this.ul.appendChild(li);
    }
}
