let data, worldData;
let minLon, maxLon, minLat, maxLat, minYield, maxYield, minYear, maxYear;
let marginTop = 60;
let marginBottom = -50;
let marginLeft = 40;
let marginRight = 40;
let yearSlider;
let yearMarks = [1945, 1950, 1960, 1970, 1980, 1990, 1998];
let sliderX, sliderW, sliderY;
let circles = [];
let UG_types = ["UG", "SHAFT", "TUNNEL", "GALLERY", "MINE", "SHAFT/GR", "SHAFT/LG"];

function preload() {
  worldData = loadJSON("https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json");
  data = loadTable("assets/dataset.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Arial");

  let allLon = data.getColumn("longitude");
  let allLat = data.getColumn("latitude");
  let allYields = data.getColumn("average_yield");
  let allYear = data.getColumn("year");

  minLon = min(allLon);
  maxLon = max(allLon);
  minLat = min(allLat);
  maxLat = max(allLat);
  minYield = min(allYields);
  maxYield = max(allYields);
  minYear = min(allYear);
  maxYear = max(allYear);

  sliderX = width / 2 - 400;
  sliderW = 800;
  sliderY = height - 70;
  yearSlider = createSlider(minYear, maxYear, maxYear, 1);
  yearSlider.position(sliderX, sliderY);
  yearSlider.style(`
    appearance: none;
    width: ${sliderW}px;
    height: 1px;
    background: rgb(0,255,0);
    accent-color: rgb(0,255,0);
  `);

  for (let i = 0; i < data.getRowCount(); i++) {
    let lat = data.getString(i, "latitude");
    let lon = data.getString(i, "longitude");
    let avgYield = data.getString(i, "average_yield");
    let year = data.getString(i, "year");
    let type = data.getString(i, "type");
    let y = map(lat, -90, 90, height - marginBottom, marginTop);
    let x = map(lon, -180, 180, marginLeft, width - marginRight);
    let r = map(avgYield, minYield, maxYield, 5, 360);

    circles.push({ i, x, y, r, year, type });
  }

  circles.sort((a, b) => b.r - a.r);
}

function draw() {
  background(0);

  let currentYear = yearSlider.value();
  fill(0, 255, 0);
  noStroke();
  textSize(12);
  textAlign(CENTER, TOP);
  let totalRange = maxYear - minYear;
  for (let i = 0; i < yearMarks.length; i++) {
    let x = sliderX + ((yearMarks[i] - minYear) / totalRange) * sliderW;
    text(yearMarks[i], x, sliderY + 12);
  }

  textSize(20);
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  text("NUCLEAR EXPLOSIONS", 40, 40);

  textAlign(LEFT, CENTER);
  textStyle(NORMAL);
  textSize(12);

  fill(0);
  stroke(0, 255, 0, 140);
  strokeWeight(1);
  rect(40, height - 100, 200, 50);

  fill(0, 255, 0, 60);
  stroke(0, 255, 0);
  strokeWeight(0.5);
  ellipse(55, height - 85, 15, 15);
  triangle(
    55, height - 73,
    47, height - 57,
    63, height - 57
  );

  noStroke();
  fill(0, 255, 0);
  text("Underground Explosions", 80, height - 65);
  text("Atmospheric Explosions", 80, height - 85);
  textSize(10);
  text("* The radius indicates the yield.", 40, height - 115);

  drawMapBorders();

  let hoveredRow = null;

  for (let c of circles) {
    let d = dist(mouseX, mouseY, c.x, c.y);
    if (d < c.r / 2) {
      hoveredRow = c.i;
    }
  }

  for (let c of circles) {
    if (c.year > currentYear) continue;

    if (hoveredRow === c.i) {
      fill(255, 0, 0, 60);
      stroke(255, 0, 0);
      strokeWeight(0.5);
    } else {
      fill(0, 255, 0, 30);
      stroke(0, 255, 0);
      strokeWeight(0.5);
    }

    if (UG_types.includes(c.type)) {
      let r = c.r / 2;
      let angle = -PI / 2;
      triangle(
        c.x + r * cos(angle),
        c.y + r * sin(angle),
        c.x + r * cos(angle + TWO_PI / 3),
        c.y + r * sin(angle + TWO_PI / 3),
        c.x + r * cos(angle + 2 * TWO_PI / 3),
        c.y + r * sin(angle + 2 * TWO_PI / 3)
      );
    } else {
      ellipse(c.x, c.y, c.r, c.r);
    }
  }
  stroke(0, 255, 0, 150);
  strokeWeight(0.3);
  line(mouseX, 0, mouseX, height);
  line(0, mouseY, width, mouseY);
  let mouseLon = map(mouseX, marginLeft, width - marginRight, -180, 180);
  let mouseLat = map(mouseY, height - marginBottom, marginTop, -90, 90);

  fill(0, 255, 0);
  noStroke();
  textSize(10);
  textAlign(RIGHT, BOTTOM);
  text(`Lon: ${mouseLon.toFixed(2)}, Lat: ${mouseLat.toFixed(2)}`, mouseX - 10, mouseY - 10);

  if (hoveredRow !== null) {
    let date = data.getString(hoveredRow, "date_DMY");
    let name = data.getString(hoveredRow, "name");
    let type = data.getString(hoveredRow, "type");
    let country = data.getString(hoveredRow, "country");
    let region = data.getString(hoveredRow, "region");

    let info =
      "Date: " + date + "\n" +
      "Name: " + name + "\n" +
      "Type: " + type + "\n" +
      "Country: " + country + "\n" +
      "Region: " + region;

    let boxX = mouseX + 10;
    let boxY = mouseY + 10;
    let padding = 8;
    textSize(10);
    let lines = info.split("\n");
    let boxW = 0;
    for (let l of lines) boxW = max(boxW, textWidth(l));
    boxW += padding * 2;

    fill(255, 0, 0, 100);
    noStroke();
    rect(boxX, boxY, boxW, 76, 6);

    fill(0,255,0);
    textAlign(LEFT, TOP);
    text(info, boxX + padding, boxY + padding);
  }
}

function drawMapBorders() {
  stroke(255, 0, 0);
  strokeWeight(0.4);
  noFill();

  for (let feature of worldData.features) {
    let coords = feature.geometry.coordinates;

    if (feature.geometry.type === "Polygon") {
      drawPolygon2D(coords);
    } else if (feature.geometry.type === "MultiPolygon") {
      for (let poly of coords) {
        drawPolygon2D(poly);
      }
    }
  }
}

function drawPolygon2D(polygon) {
  for (let ring of polygon) {
    beginShape();
    for (let coord of ring) {
      let lon = coord[0];
      let lat = coord[1];
      let y = map(lat, -90, 90, height - marginBottom, marginTop);
      let x = map(lon, -180, 180, marginLeft, width - marginRight);
      vertex(x, y);
    }
    endShape();
  }
}