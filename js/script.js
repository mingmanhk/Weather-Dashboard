var SearchformEl =document.querySelector('#search-form');
var SearchInputEl = document.getElementById("citysearch-input");
var HistoryLogContainerEl = document.getElementById("search-history");
var TodayEl = document.querySelector('#Today');
var FiveDaysEl = document.getElementById("FiveDays");
var CityEl = document.getElementById("cityname");
var today = moment();
var cityseachhistory = [];

//show history log
var displayhistorylog = function () {
    HistoryLogContainerEl.innerHTML = "";
    var teampcityseachhistory = JSON.parse(localStorage.getItem("cityseachhistory"));
    if (teampcityseachhistory != null) {
        cityseachhistory = teampcityseachhistory;
          $.each(teampcityseachhistory, function (row, city) {
              var historyEl = document.createElement('div');
              historyEl.classList = 'list-item flex-row justify-space-between align-center';
              var historycitynameEl = document.createElement('p');
              historycitynameEl.classList = 'text-align-center';
                historycitynameEl.textContent = city;
              historyEl.appendChild(historycitynameEl);
              HistoryLogContainerEl.appendChild(historyEl);
        })
    } else
    {
        localStorage.setItem("cityseachhistory", JSON.stringify(cityseachhistory));
    }       
}

//GetAPI Today Weather Forecast by location but this API does not offer UV index info, so i use this API to get location(lat & lon) then call for new API to get all weather data
var Getlocationdata = function (city) {
    var apiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=eb65f1cf1f7d8dd29c08ea981b35b0f6';
    fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
         GetTodayUV(city, data.coord.lat,data.coord.lon,data.dt)
        });
      } else {
        showalertmsg('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      showalertmsg("Getlocationdata API: "+error);
    });
};

//GetAPI 5 day Weather Forecast by location
var Get5daysWeather = function (city) {
    var apiUrl = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city +'&cnt=40&appid=eb65f1cf1f7d8dd29c08ea981b35b0f6';
    fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
        response.json().then(function (data) {
          show5dayforecast(city, data.list);
        });
      } else {
        showalertmsg('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      showalertmsg("Get5daysWeather API: "+error);
    });
};

//GetAPI Currenty UV Weather Forecast by location use for get all today forecast data
var GetTodayUV = function (city, lat, lon, dt) {
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + lat +'&lon='+lon+ '&dt='+dt+'&exclude=minutely,hourly,daily,alerts&appid=eb65f1cf1f7d8dd29c08ea981b35b0f6';
    fetch(apiUrl)
    .then(function (response) {
      if (response.ok) {
          response.json().then(function (data) {
            showtodayforecast(city, data.current);
        });
      } else {
        showalertmsg('Error: ' + response.statusText);
      }
    })
    .catch(function (error) {
      showalertmsg("GetTodayUV API: "+error);
    });
};

//Show today forecast data
var showtodayforecast = function (city,data) {
    //get element
    var todayEl = $('.today')
    var weatherEL = $('<div>');
    //reset today forecast data
    todayEl.empty();
    //create element for city and date
    var cityanddateEl = $('<p>');
    var citynameEl = $('<h2>').addClass('displayinline').text(city + "     " );
    var datenameEl = $('<h2>').addClass('displayinline').text("("+today.format('l')+ ")     " );
    var IconEl = $('<p>').addClass('displayinline');
    var IconImageEl = $('<img>').attr('src', "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png");
    IconEl.append(IconImageEl);
    cityanddateEl.append(
        citynameEl,
        datenameEl,
        IconEl
    )
    //create section for weather data
    var TempEl = $('<p>').text("Temp: "+ ((((data.temp-273.15)*9)/5)+32).toFixed(2) +" ℉");
    var WindEl = $('<p>').text("Wind: "+ (data.wind_speed*2.237).toFixed(2)+" MPH");
    var HumidityEl = $('<p>').text("Humidity: " + data.humidity + " %");
    var UVIndexEl = $('<p>').text("UV Index: ");
    var UVIndexValueEl = $('<div>').addClass('displayinline').text(data.uvi);
    // UV Index Number	Exposure Level	Color Code
    // 2 or less	Low	Green
    // 3 to 5	Moderate	Yellow
    // 6 to 7	High	Orange
    // 8 to 10	Very High	Red
    // 11+	Extreme	Violet
   if ((data.uvi)<= 2) { UVIndexValueEl.css({'background-color': 'green', 'color': 'white'})}
   else if (data.uvi >= 3 && data.uvi <= 5) {UVIndexValueEl.css({'background-color': 'yellow', 'color': 'white'})}
   else if (data.uvi >= 6 && data.uvi <= 7) {UVIndexValueEl.css({'background-color': 'orange', 'color': 'white'})}
   else if (data.uvi >= 8 && data.uvi <= 10) { UVIndexValueEl.css({'background-color': 'red', 'color': 'white'})}
   else if (data.uvi >= 11) { UVIndexValueEl.css({ 'background-color': 'violet', 'color': 'white'})}

    UVIndexEl.append(UVIndexValueEl)
    weatherEL.append(
            cityanddateEl,
            TempEl,
            WindEl,
            HumidityEl,
            UVIndexEl
    );
    todayEl.parent('div').addClass('forecast');
    todayEl.append(weatherEL);
}

//Show five days forecast data
var show5dayforecast = function (city, data) {
    //get element
    var fivedayEl = $('.fivedays')
    var weatherEL = $('<div>');
    weatherEL.addClass('row justify-content-between');
    fivedayEl.textContent = "5 Day Forecast";
    //reset five days forecast data
    fivedayEl.empty();
    //create element 
  for (var i = 0; i < data.length; i++) {
    if ((i % 8) == 0) {
      var weathercardEL = $('<div>');
        weathercardEL.addClass('list-item col-2');
        var DateEl = $('<h4>').text(moment((data[i].dt_txt)).format('l'));
        var IconEl = $('<p>');
        var IconImageEl = $('<img>').attr('src', "http://openweathermap.org/img/w/" + data[i].weather[0].icon + ".png");
        var TempEl = $('<p>').text("Temp: " + ((((data[i].main.temp-273.15)*9)/5)+32).toFixed(2) +" ℉");
        var WindEl = $('<p>').text("Wind: "+ ((data[i].wind.speed)*2.237).toFixed(2)+" MPH");
        var HumidityEL = $('<p>').text("Humidity: " + data[i].main.humidity + " %");
        IconEl.append(IconImageEl);
        weathercardEL.append(
            DateEl,
            IconEl,
            TempEl,
            WindEl,
            HumidityEL
        );
        weatherEL.append(weathercardEL);
      }
        
    }
    fivedayEl.append(weatherEL);
}   

//post alert message
var showalertmsg= function(msg){
    var alertEl = $('.alert')
    var errorEL = $('<p>').text(msg);
    alertEl.empty();
    alertEl.parent('div').addClass('alert');
    alertEl.append(errorEL);
}

//add the city to the history log
var addhistorylog = function (city) {
    cityseachhistory.push(city);
    localStorage.setItem("cityseachhistory", JSON.stringify(cityseachhistory));
    displayhistorylog()
}

//click search action
var formSubmitHandler = function (event) {
    event.preventDefault();
    $('.alert').empty();
    $('.fivedays').empty();
    $('.today').empty();
    $('.today').parent('div').removeClass('forecast');
    var cityname = SearchInputEl.value.trim();
    if (cityname) {
        //add city to history log
        addhistorylog(cityname);
        //Get today forecast
        Getlocationdata(cityname);
        //Get 5 day forecast
        Get5daysWeather(cityname);
    } else {
        showalertmsg('Please enter a city to search!');
    }
}

//click history log city
var formClickHandler = function (event) {
    $('.alert').empty();
    $('.fivedays').empty();
    $('.today').empty();
    $('.today').parent('div').removeClass('forecast');
    var cityname = event.target.textContent;
    SearchInputEl.value = cityname;
    event.preventDefault();
    //add city to history log
    addhistorylog(cityname);
    //Get today forecast
    Getlocationdata(cityname);
    //Get 5 day forecast
    Get5daysWeather(cityname);
   
}

//add event to button
SearchformEl.addEventListener('submit', formSubmitHandler);
HistoryLogContainerEl.addEventListener('click', formClickHandler);

//init page
displayhistorylog();