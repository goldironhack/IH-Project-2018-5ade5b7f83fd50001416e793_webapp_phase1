//------------------------------------------ Datasets Getters ----------------------------------------
const NEIGHBORHOOD_TABULATION_AREAS = "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson"
const MUSEUMS_DATASE_URL = "https://data.cityofnewyork.us/api/views/fn6f-htvy/rows.json?accessType=DOWNLOAD"
const GALLERIES_URL = "https://data.cityofnewyork.us/api/views/43hw-uvdj/rows.json?accessType=DOWNLOAD"
const MARKETS_URL = "https://data.cityofnewyork.us/api/views/j8gx-kc43/rows.json?accessType=DOWNLOAD"
const AIR_QUALITY_URL = "https://data.cityofnewyork.us/api/views/c3uy-2p5r/rows.json?accessType=DOWNLOAD"
const NEIGHBORHOOD_NAMES = "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD"
const HOUSING_BY_BUILDING = "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD"
const BOROUGHTS_NAMES = ["Manhattan", "The Bronx", "Brooklyn", "Queens", "Staten Island"]
const NEW_YORK_UNNIVERSITY = {lat: 40.7291,lng: -73.9965}
const HOUSING_SCORES = [10, 8, 7, 4, 1]
const TABLE_NAMES = ["distanceTable", "crimesTable", "affordabilityTable", "bestOptionsTable"]
const CRIME_RATIO = 1000

const DATASET_URLS = {
		NEIGHBORHOOD_TABULATION_AREAS : "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/nycd/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=geojson",
		MUSEUMS_DATASE_URL: "https://data.cityofnewyork.us/api/views/fn6f-htvy/rows.json?accessType=DOWNLOAD",
		GALLERIES_URL: "https://data.cityofnewyork.us/api/views/43hw-uvdj/rows.json?accessType=DOWNLOAD",
		MARKETS_URL: "https://data.cityofnewyork.us/api/views/j8gx-kc43/rows.json?accessType=DOWNLOAD",
		AIR_QUALITY_URL: "https://data.cityofnewyork.us/api/views/c3uy-2p5r/rows.json?accessType=DOWNLOAD", 
		NEIGHBORHOOD_NAMES: "https://data.cityofnewyork.us/api/views/xyye-rtrs/rows.json?accessType=DOWNLOAD",
		HOUSING_BY_BUILDING: "https://data.cityofnewyork.us/api/views/hg8x-zxpr/rows.json?accessType=DOWNLOAD",
}
/*
//--------------------------------------------------------------------------------
Flow:
Request all the data from all the datasets:

getNB(NEIGHBORHOOD_TABULATION_AREAS)
getMuseums(MUSEUMS_DATASE_URL)
getGalleries(GALLERIES_URL)
getMarkets(MARKETS_URL)
getAirQuality(AIR_QUALITY_URL)
getCrimes()
getNeighborhoodNames(NEIGHBORHOOD_NAMES)
getHousingData(HOUSING_BY_BUILDING)

All the data is storaged on the <datase_name>array variable
//--------------------------------------------------------------------------------
*/
var neighborhoodsData = []
var crimeData = []


function populateDatasets(){
	//Getting neighborhood data
	$.get(DATASET_URLS["NEIGHBORHOOD_TABULATION_AREAS"], ( response ) => {
		neighborhoodsData = response.data;
	}).fail( ( response, status, error ) => {
		// errors:
		console.error(error);
	}).always( ( response, status, error ) => {
	});
	// Getting crimes
	$.ajax({
    url: "https://data.cityofnewyork.us/resource/9s4h-37hy.json?$where=cmplnt_to_dt between '2015-12-31T00:00:00.000' and '2015-12-31T23:59:59.000' and within_circle(lat_lon, 40.7291, -73.9965, 50000)",
    type: "GET",
    data: {
      "$limit" : CRIME_RATIO,
      "$$app_token" : "j8zrS5jGkSUon2f1iDg6gnJim"
    }
	}).done(function(data) {
	  	crimeData = data;
	});


}



var map;

var neighborhood_geoArray = []
var neighborhoodCenterPoints = []
var districts = []
var distances = []
var crimes = []
var museumsArray = []
var galleriesArray = []
var crimeLocations = []
var housingData = []
var housingScores = []
var bestHouses = []

function getNB( url ){
	var data = $.get(url, () => {
		console.log(JSON.parse(data.responseText))
	})
		.done(function () {
			console.log(data)
			let responseJSON = JSON.parse(data.responseText)
			//console.log(responseJSON)
			for (var i = 0; i < responseJSON.features.length; i++){
			neighborhood_geoArray.push({BoroCD : responseJSON.features[i].properties.BoroCD, geometry : responseJSON.features[i].geometry.coordinates, geometryType: responseJSON.features[i].geometry.type, borough: ""})
				if(neighborhood_geoArray[i].BoroCD < 200){
					neighborhood_geoArray[i].borough = BOROUGHTS_NAMES[0];
				}else if(neighborhood_geoArray[i].BoroCD < 300){
					neighborhood_geoArray[i].borough = BOROUGHTS_NAMES[1];
				}else if(neighborhood_geoArray[i].BoroCD < 400){
					neighborhood_geoArray[i].borough = BOROUGHTS_NAMES[2];
				}else if(neighborhood_geoArray[i].BoroCD < 500){
					neighborhood_geoArray[i].borough = BOROUGHTS_NAMES[3];
				}else{
					neighborhood_geoArray[i].borough = BOROUGHTS_NAMES[4];
				} 
			}
			//Normalizing geometry
			for (var i = 0; i < neighborhood_geoArray.length; i++) {
				if (neighborhood_geoArray[i].geometryType == "MultiPolygon") {
					for (var j = 0; j < neighborhood_geoArray[i].geometry.length; j++) {
						for (var g = 0; g < neighborhood_geoArray[i].geometry[j].length; g++) {
							for (var k = 0; k < neighborhood_geoArray[i].geometry[j][g].length; k++) {
								var point = {lat: neighborhood_geoArray[i].geometry[j][g][k][1], lng: neighborhood_geoArray[i].geometry[j][g][k][0]}
								neighborhood_geoArray[i].geometry[j][g][k] = point
							}
						}
					}
				}else{
					for (var j = 0; j < neighborhood_geoArray[i].geometry.length; j++) {
						for (var g = 0; g < neighborhood_geoArray[i].geometry[j].length; g++) {
								var point = {lat: neighborhood_geoArray[i].geometry[j][g][1], lng: neighborhood_geoArray[i].geometry[j][g][0]}
								neighborhood_geoArray[i].geometry[j][g] = point
						}
					}
				}
			}
		})
		.fail(function (error) {
			//fail
			console.error(error);
		})
}
function getGalleries( url ){
	var data = $.get(url, () => {
		
	})
		.done(function () {
			console.log(data)
			for (var g = 0; g < data.responseJSON.data.length-1; g++){
				var point = data.responseJSON.data[g][9]
				point = point.substring(7, point.length-1)
				point = point.split(" ")
				
				// Create array of float for each pair of coordinate
				var a = point.length; 
				for (i = 0; i < a; i++) {
				    point[i] = parseFloat(point[i]);
				}

				galleriesArray.push({lng: (point[0]), lat: point[1]})
			}
		})
		.fail(function (error) {
			//fail
			console.error(error);
		})
}
function getMuseums( url ){
	var data = $.get(url, () => {
		
	})
		.done(function () {
			for (var g = 0; g < data.responseJSON.data.length-1; g++){
				var point = data.responseJSON.data[g][8]
				point = point.substring(7, point.length-1)
				point = point.split(" ")
				
				// Create array of float for each pair of coordinate
				var a = point.length; 
				for (i = 0; i < a; i++) {
				    point[i] = parseFloat(point[i]);
				}

				museumsArray.push({lng: (point[0]), lat: point[1]})
			}
		})
		.fail(function (error) {
			//fail
			console.error(error);
		})
}
function getMarkets( url ){
	var data = $.get(url, () => {
		
	})
		.done(function () {
			for (var g = 0; g < data.responseJSON.data.length-1; g++){
				var point = data.responseJSON.data[g]
			}
			
		})
		.fail(function (error) {
			//fail
			console.error(error);
		})
}
function getAirQuality( url ){
	var data = $.get(url, () => {
	})
		.done(function () {
			console.log(data)
			for (var g = 0; g < data.responseJSON.data.length-1; g++){
				var point = data.responseJSON.data[g]
				
			}
			
		})
		.fail(function (error) {
			//fail
			console.error(error);
		})
}
function getCrimes(){
	//$where=within_circle(lat_lon, 40.7291, -73.9965, 50000)cmplnt_to_dt
	$.ajax({//https://data.cityofnewyork.us/resource/9s4h-37hy.json?cmplnt_fr_dt=1015-02-14T00:00:00.000
    url: "https://data.cityofnewyork.us/resource/9s4h-37hy.json?$where=cmplnt_to_dt between '2015-12-31T00:00:00.000' and '2015-12-31T23:59:59.000' and within_circle(lat_lon, 40.7291, -73.9965, 50000)",
    type: "GET",
    data: {
      "$limit" : "1000000",
      "$$app_token" : "j8zrS5jGkSUon2f1iDg6gnJim"
    }
	}).done(function(data) {
	  for (var i = 0; i < data.length; i++) {
	  	let latLng = data[i].lat_lon.coordinates
	  	crimeLocations.push({lat: latLng[1], lng: latLng[0]})

	  }
	});
}
function getNeighborhoodNames(url){
	var data = $.get(url, () => {
		console.log(data.responseJSON)
	})
		.done(function () {
			console.log(data)
			for (var i = 0; i < data.responseJSON.data.length; i++) {
				var point = data.responseJSON.data[i][9]
				point = point.substring(7, point.length-1)
				point = point.split(" ")
				
				// Create array of float for each pair of coordinate
				var a = point.length; 
				for (var j = 0; j < a; j++) {
				    point[j] = parseFloat(point[j]);
				}
				neighborhoodCenterPoints.push({lng: (point[0]), lat: point[1]})
			}
		})
		.fail(function (error) {
			//fail
			console.error(error);
		})
}
function getHousingData(url){
	var data = $.get(url, () => {
	})
		.done(function () {	
			for (var i = 0; i < data.responseJSON.data.length; i++) {
				if(!(data.responseJSON.data[i][9] == "CONFIDENTIAL")){
					housingData.push({
						location : {lat: data.responseJSON.data[i][23], lng: data.responseJSON.data[i][24]},
						extremeLow: data.responseJSON.data[i][31],
						veryLow: data.responseJSON.data[i][32],
						low: data.responseJSON.data[i][33],
						moderate: data.responseJSON.data[i][34],
						middle: data.responseJSON.data[i][35],
						score: (data.responseJSON.data[i][31] * HOUSING_SCORES[0]) + (data.responseJSON.data[i][32] * HOUSING_SCORES[1]) + (data.responseJSON.data[i][33] * HOUSING_SCORES[2]) + (data.responseJSON.data[i][34] * HOUSING_SCORES[3]) + (data.responseJSON.data[i][35] * HOUSING_SCORES[4])
					})
				}
			}
		})
		.fail(function (error) {
			//fail
			console.error(error);
		})
}
function drawNB(){
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		for (var j = 0; j < neighborhood_geoArray[i].geometry.length; j++) {
			neighborhood_geoArray[i].nbBoundaries = []
			var color = getRandomColor()
			var opacity = 0.2
			var nbBoundaries = new google.maps.Polygon({
			    paths: neighborhood_geoArray[i].geometry[j],
			    strokeColor: color,
			    strokeOpacity: 0.8,
			    strokeWeight: 2,
			    fillColor: color,
			    fillOpacity: opacity
			});
			nbBoundaries.setMap(map);
			neighborhood_geoArray[i].nbBoundaries.push(nbBoundaries)
		}
	}
}
function drawMuseums() {

	for (var i = 0; i < museumsArray.length-1; i++) {
		var marker = new google.maps.Marker({
          position: museumsArray[i],
          map: map,
          icon: "img/museum.png",
          title: 'Hello World!'
    });
	}
}
function drawGalleries() {
	for (var i = 0; i < galleriesArray.length-1; i++) {
		var marker = new google.maps.Marker({
          position: galleriesArray[i],
          map: map,
          icon: "img/canvas.png",
          title: 'Hello World!'
    });
	}
}
function drawDistricsCenters(){
	var curPosition;
	var color;
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		neighborhood_geoArray[i].nbCenters = []
		neighborhood_geoArray[i].distanceFromUni = 0
		neighborhood_geoArray[i].distanceRank = 0
	}
	for (var i = 0; i < neighborhoodCenterPoints.length; i++) {
		for (var j = 0; j < neighborhood_geoArray.length; j++) {
			curPosition = new google.maps.LatLng(neighborhoodCenterPoints[i].lat,neighborhoodCenterPoints[i].lng);
			if (google.maps.geometry.poly.containsLocation(curPosition, neighborhood_geoArray[j].nbBoundaries[0])){
				neighborhood_geoArray[j].nbCenters.push(curPosition)
				break;
			}
		}
	}
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		let bounds = new google.maps.LatLngBounds();
		for (var j = 0; j < neighborhood_geoArray[i].nbCenters.length; j++) {
	 		bounds.extend(neighborhood_geoArray[i].nbCenters[j]);
		}
		let center = bounds.getCenter()
		neighborhood_geoArray[i].districtCenter = center
	}

	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		let pointA = new google.maps.LatLng(NEW_YORK_UNNIVERSITY.lat, NEW_YORK_UNNIVERSITY.lng)
		neighborhood_geoArray[i].distanceFromUni = google.maps.geometry.spherical.computeDistanceBetween(neighborhood_geoArray[i].districtCenter, pointA)
		if(neighborhood_geoArray[i].distanceFromUni > 26574){
			neighborhood_geoArray[i].distanceFromUni = 26574
		}
		distances.push({distanceFromUni: neighborhood_geoArray[i].distanceFromUni, index: i})
	}

	distances.sort(compareDistances)

	for (var i = 0; i < distances.length; i++) {
		neighborhood_geoArray[distances[i].index].distanceRank = i + 1
	}

	for (var i = 0; i < 10; i++) {
		var marker = new google.maps.Marker({
	    position: neighborhood_geoArray[distances[i].index].districtCenter,
	    map: map,
      title: 'Hello World!'
	  });

	}
}
function compareDistances(a,b) {
  if (a.distanceFromUni < b.distanceFromUni)
    return -1;
  if (a.distanceFromUni > b.distanceFromUni)
    return 1;
  return 0;
}
function compareScores(a,b) {
  if (a.score > b.score)
    return -1;
  if (a.score < b.score)
    return 1;
  return 0;
}
function compareBestOption(a,b) {
  if (a.consolidateRank < b.consolidateRank)
    return -1;
  if (a.consolidateRank > b.consolidateRank)
    return 1;
  return 0;
}
function compareCrimes(a,b) {
  if (a.crimes > b.crimes)
    return -1;
  if (a.crimes < b.crimes)
    return 1;
  return 0;
}
function arrangeCrimesPerDistric(){
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		neighborhood_geoArray[i].crimes = 0
		neighborhood_geoArray[i].crimeRank = 0
	}
	var aux = false;
	for (var i = 0; i < crimeLocations.length; i++) {
		for (var j = 0; j < neighborhood_geoArray.length; j++) {
			for (var k = 0; k < neighborhood_geoArray[j].nbBoundaries.length; k++) {
				curPosition = new google.maps.LatLng(crimeLocations[i].lat,crimeLocations[i].lng);
				if (google.maps.geometry.poly.containsLocation(curPosition, neighborhood_geoArray[j].nbBoundaries[k])){
						neighborhood_geoArray[j].crimes = neighborhood_geoArray[j].crimes + 1
						aux = true;
						break;
				}	
			}
			if(aux){
				aux = false;
				break;
			}
		}
	}

	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		crimes[i] = {crimes : neighborhood_geoArray[i].crimes, index: i}
	}

	crimes.sort(compareCrimes)


	for (var i = 0; i < crimes.length; i++) {
		neighborhood_geoArray[crimes[i].index].crimeRank = crimes.length - i
	}

	updateSecurityTable()
}
function updateDistanceTable(){
	tableReference = $("#mainDistanceTableBody")[0];
	var newRow, borough, districtID, distance;
	var distanceTableJson = {}

	for (var i = 0; i < distances.length; i++) {
		newRow = tableReference.insertRow(tableReference.rows.length);
		borough = newRow.insertCell(0);
		districtID = newRow.insertCell(1);
		distance = newRow.insertCell(2);
		if(neighborhood_geoArray[distances[i].index].BoroCD < 200){
			borough.innerHTML = BOROUGHTS_NAMES[0];
		}else if(neighborhood_geoArray[distances[i].index].BoroCD < 300){
			borough.innerHTML = BOROUGHTS_NAMES[1];
		}else if(neighborhood_geoArray[distances[i].index].BoroCD < 400){
			borough.innerHTML = BOROUGHTS_NAMES[2];
		}else if(neighborhood_geoArray[distances[i].index].BoroCD < 500){
			borough.innerHTML = BOROUGHTS_NAMES[3];
		}else{
			borough.innerHTML = BOROUGHTS_NAMES[4];
		} 
		districtID.innerHTML = neighborhood_geoArray[distances[i].index].BoroCD;
		distance.innerHTML = distances[i].distanceFromUni;
	}
}
function updateSecurityTable(){
	tableReference = $("#mainSecrurityTableBody")[0];
	var newRow, borough, districtID, crimesAmount;
	
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		newRow = tableReference.insertRow(tableReference.rows.length);
		borough = newRow.insertCell(0);
		districtID = newRow.insertCell(1);
		crimesAmount = newRow.insertCell(2);
		if(neighborhood_geoArray[crimes[i].index].BoroCD < 200){
			borough.innerHTML = BOROUGHTS_NAMES[0];
		}else if(neighborhood_geoArray[crimes[i].index].BoroCD < 300){
			borough.innerHTML = BOROUGHTS_NAMES[1];
		}else if(neighborhood_geoArray[crimes[i].index].BoroCD < 400){
			borough.innerHTML = BOROUGHTS_NAMES[2];
		}else if(neighborhood_geoArray[crimes[i].index].BoroCD < 500){
			borough.innerHTML = BOROUGHTS_NAMES[3];
		}else{
			borough.innerHTML = BOROUGHTS_NAMES[4];
		} 
		districtID.innerHTML = neighborhood_geoArray[crimes[i].index].BoroCD;
		crimesAmount.innerHTML = crimes[i].crimes;
	}
}
function updateAffordabilityTable(){
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		neighborhood_geoArray[i].housingAfData = []
		neighborhood_geoArray[i].affodableScore = 0
		neighborhood_geoArray[i].housingRank = 0
	}

	for (var i = 0; i < housingData.length; i++) {
		for (var j = 0; j < neighborhood_geoArray.length; j++) {
			curPosition = new google.maps.LatLng(housingData[i].location.lat, housingData[i].location.lng);
			if (google.maps.geometry.poly.containsLocation(curPosition, neighborhood_geoArray[j].nbBoundaries[0])){
				neighborhood_geoArray[j].housingAfData.push(housingData[i])
				break;
			}
		}
	}
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		for (var j = 0; j < neighborhood_geoArray[i].housingAfData.length; j++) {
			neighborhood_geoArray[i].affodableScore = neighborhood_geoArray[i].affodableScore + neighborhood_geoArray[i].housingAfData[j].score
		}
	}

	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		housingScores.push({score: neighborhood_geoArray[i].affodableScore, index: i})
	}

	housingScores.sort(compareScores)


	for (var i = 0; i < housingScores.length; i++) {
		neighborhood_geoArray[housingScores[i].index].housingRank = i + 1
	}

	tableReference = $("#mainAffordabilityTableBody")[0];
	var newRow, borough, districtID, extremeLow, veryLow, low, moderate, middle;
	
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		newRow = tableReference.insertRow(tableReference.rows.length);
		borough = newRow.insertCell(0);
		districtID = newRow.insertCell(1);
		extremeLow = newRow.insertCell(2);
		veryLow = newRow.insertCell(3);
		low = newRow.insertCell(4);
		moderate = newRow.insertCell(5);
		middle = newRow.insertCell(6);
		borough.innerHTML = neighborhood_geoArray[housingScores[i].index].borough
		districtID.innerHTML = neighborhood_geoArray[housingScores[i].index].BoroCD;
		extremeLow.innerHTML = housingData[i].extremeLow;
		veryLow.innerHTML = housingData[i].veryLow;
		low.innerHTML = housingData[i].low;
		moderate.innerHTML = housingData[i].moderate;
		middle.innerHTML = housingData[i].middle;
	}
}
function calculateBestHouses(){
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		var consolidateRank = 0
		if(neighborhood_geoArray[i].crimeRank < neighborhood_geoArray[i].distanceRank){
			consolidateRank = neighborhood_geoArray[i].distanceRank - neighborhood_geoArray[i].crimeRank
			consolidateRank = consolidateRank/2
			consolidateRank += neighborhood_geoArray[i].crimeRank
		}else{
			consolidateRank = neighborhood_geoArray[i].crimeRank - neighborhood_geoArray[i].distanceRank
			consolidateRank = consolidateRank/2
			consolidateRank += neighborhood_geoArray[i].distanceRank
		}
		neighborhood_geoArray[i].consolidateRank = consolidateRank
	}

	neighborhood_geoArray.sort(compareBestOption)


	tableReference = $("#bestOptionTableBody")[0];
	var newRow, borough, districtID, crimes, distance;
	
	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		newRow = tableReference.insertRow(tableReference.rows.length);
		borough = newRow.insertCell(0);
		districtID = newRow.insertCell(1);
		crimes = newRow.insertCell(2);
		distance = newRow.insertCell(3);
		borough.innerHTML = neighborhood_geoArray[i].borough
		districtID.innerHTML = neighborhood_geoArray[i].BoroCD;
		crimes.innerHTML = neighborhood_geoArray[i].crimes;
		distance.innerHTML = neighborhood_geoArray[i].distanceFromUni;
	}
}
//------------------------------------------ Google Maps ---------------------------------------------
function onGoogleMapResponse(){
	map = new google.maps.Map(document.getElementById('googleMapContainer'), {
		zoom: 10
	});

	var country = "New York";
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address' : country}, function(results, status){
		if(status == google.maps.GeocoderStatus.OK){
			map.setCenter(results[0].geometry.location);
		};
	});

	var marker = new google.maps.Marker({
    position: NEW_YORK_UNNIVERSITY,
    map: map,
    title: 'Hello World!'
  });
}
//--------------------------------------- miselaneous --------------------------------------
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
function exportTableToCSV(tableId) {

    var csv = [];
    var rows = document.querySelectorAll("#" + tableId + " tr");
    
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        
        for (var j = 0; j < cols.length; j++) 
            row.push(cols[j].innerText);
        
        csv.push(row.join(","));        
    }

    // Download CSV file
    downloadCSV(csv.join("\n"), tableId);
}
function downloadCSV(csv, name) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = name;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}
function exportCrimes(){
	exportTableToCSV(TABLE_NAMES[1])
}
function exportDistance(){
	exportTableToCSV(TABLE_NAMES[0])
}
function exportAffordability(){
	exportTableToCSV(TABLE_NAMES[2])
}
function exportBestTable(){
	exportTableToCSV(TABLE_NAMES[3])
}
//--------------------------------------- d3.js --------------------------------------------
function drawDistrictChart(borough){
	//Clearing the last chart if exist
	d3.select("#chart5").selectAll("*").remove()
	var data = [];
	var color = "white"
	switch (borough) {
	  case BOROUGHTS_NAMES[0]:
	    for(var i=0; i<5; i++) data[i] = {title: i, value: [Math.round(Math.random()*100)]};
	    color = getRandomColor()
	    break;
	  case BOROUGHTS_NAMES[1]:
	    for(var i=0; i<10; i++) data[i] = {title: i, value: [Math.round(Math.random()*100)]};
	    color = getRandomColor()
	    break;
    case BOROUGHTS_NAMES[2]:
    	for(var i=0; i<15; i++) data[i] = {title: i, value: [Math.round(Math.random()*100)]};
	    color = getRandomColor()
	    break;
    case BOROUGHTS_NAMES[3]:
    	for(var i=0; i<20; i++) data[i] = {title: i, value: [Math.round(Math.random()*100)]};
	    color = getRandomColor()
	    break;
    case BOROUGHTS_NAMES[4]:
    	for(var i=0; i<25; i++) data[i] = {title: i, value: [Math.round(Math.random()*100)]};
	    color = getRandomColor()
	    break;
	}

	/* Define an accessor function */
	let circle = circularHeatChart(data.length, 50, "white", color)

	circle.accessor(function(d) {return d.value;})

	d3.select('#chart5')
	    .selectAll('svg')
	    .data([data])
	    .enter()
	    .append('svg')
	    .call(circle);

	/* Add a mouseover event */
	/*
	d3.selectAll("#chart4 path").on('click', function() {
	    var d = d3.select(this).data()[0];
	    //console.log(d.title);
	    drawDistrictChart(d.title);
	});
	*/	
}
function drawBarChart(borough){
	d3.select("#barChartDivSVG").selectAll("*").remove()
	var parentDivWidth = document.getElementById("barChartDiv").offsetWidth
	var parentDivHeight = document.getElementById("barChartDiv").offsetHeight
	var svg = d3.select("#barChartDivSVG")
  var margin = {top: 5, right: 10, bottom: 30, left: 40}
  var width = parentDivWidth - margin.left - margin.right
  var height = parentDivHeight - margin.top - margin.bottom
  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var x0 = d3.scaleBand()
	    .rangeRound([0, width])
	    .paddingInner(0.1);

	var x1 = d3.scaleBand()
	    .padding(0.05);

	var y = d3.scaleLinear()
	    .rangeRound([height, 0]);

	var z = d3.scaleOrdinal()
	    .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);
	    
	var data = []
	var dataKeys = {columns: ["BoroCD", "distanceFromUni", "Crimes", "Affodability"]}

	for (var i = 0; i < neighborhood_geoArray.length; i++) {
		if(neighborhood_geoArray[i].borough == BOROUGHTS_NAMES[borough]){
			data.push({"BoroCD" : neighborhood_geoArray[distances[i].index].BoroCD,  "distanceFromUni": neighborhood_geoArray[distances[i].index].distanceFromUni/distances[distances.length-1].distanceFromUni,  "Crimes": neighborhood_geoArray[distances[i].index].crimes/crimes[0].crimes, Affodability: neighborhood_geoArray[i].affodableScore/housingScores[0].score})
		}
	}
  var keys = dataKeys.columns.slice(1);

  x0.domain(data.map(function(d) { return d.BoroCD; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();

  g.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x0(d.BoroCD) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return z(d.key); });

  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x0));

  g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
      .attr("x", 2)
      .attr("y", y(y.ticks().pop()) + 0.5)
      .attr("dy", "0.32em")
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Score");

  var legend = g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", z);

  legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function(d) { return d; });

  drawCircularChar()
}
function drawCircularChar(){

	/* Define an array of objects */
	var data = [];
	//for(var i=0; i<15; i++) data[i] = {title: "Segment "+i, value: Math.round(Math.random()*100)};

	// for (var i = 0; i < neighborhood_geoArray; i++) {
		
	// }

	data = [{title: "Crimes ", value: neighborhood_geoArray[57].crimes/crimes[0].crimes}, {title: "Distance ", value: neighborhood_geoArray[57].distanceFromUni/distances[distances.length-1].distanceFromUni}, {title: "Affodability ", value: neighborhood_geoArray[57].affodableScore/housingScores[0].score}]


	var chart = circularHeatChart()
		.range(["white", "green"])
		.innerRadius(30)
		.numSegments(3)
		.segmentHeight(30)


	/* Define an accessor function */
	chart.accessor(function(d) {return d.value;})

	d3.select('#circularChartDivSVG')
	    .selectAll('svg')
	    .data([data])
	    .enter()
	    .append('svg')
	    .call(chart);

	/* Add a mouseover event */
	d3.selectAll("#circularChartDivSVG path").on('mouseover', function() {
	    var d = d3.select(this).data()[0];
	});
}
$(document).ready( function(){
	
	$("#drawNB").on("click", drawNB)
	$("#drawMuseums").on("click", drawMuseums)
	$("#drawGalleries").on("click", drawBarChart)
	$("#drawDistances").on("click", drawDistricsCenters)
	$("#updateDistanceTable").on("click", updateDistanceTable)
	$("#updateCrimesTable").on("click", arrangeCrimesPerDistric)
	$("#updateAffodabilityTable").on("click", updateAffordabilityTable)
	$("#drawBarChart").on("click", drawBarChart, 0)
	$("#exportCrimes").on("click", exportCrimes)
	$("#exportDistance").on("click", exportDistance)
	$("#exportAffordability").on("click", exportAffordability)
	$("#exportConsolidateRank").on("click", exportBestTable)
	$("#consolidateRank").on("click", calculateBestHouses)

	getNB(NEIGHBORHOOD_TABULATION_AREAS)
	getMuseums(MUSEUMS_DATASE_URL)
	getGalleries(GALLERIES_URL)
	getMarkets(MARKETS_URL)
	getAirQuality(AIR_QUALITY_URL)
	getCrimes()
	getNeighborhoodNames(NEIGHBORHOOD_NAMES)
	getHousingData(HOUSING_BY_BUILDING)
})
