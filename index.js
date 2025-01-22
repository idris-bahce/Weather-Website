import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";

const app = express();
const port = 3000;
dotenv.config();
const APIKEY = process.env.API_KEY;
const URL = "http://api.openweathermap.org";

//Format the time accordingly to API
function formatTimeFromShift(shiftInSeconds) {
  let t = new Date();
  let s = t.getUTCSeconds();
  let m = t.getUTCMinutes() * 60;
  let h = t.getUTCHours() * 3600;
  let timeInSeconds = s + m + h + shiftInSeconds;
  let hour = Math.floor(timeInSeconds / 3600) % 24;
  let minute = Math.floor((timeInSeconds % 3600) / 60);
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/city", async (req, res) => {
  const city = req.body.city;
  try {
    const result = await axios.get(
      URL + `/geo/1.0/direct?q=${city}&limit=3&appid=${APIKEY}`
    );
    res.render("city.ejs", { cities: result.data });
  } catch (error) {
    console.log(error.response.data);
    res.status(500);
  }
});
app.post("/select-city", async (req, res) => {
  const { name, lat, lon } = req.body;

  try {
    const weatherResult = await axios.get(
      URL + `/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}`
    );

    //Set the time to celcius
    let temp = weatherResult.data.main.temp;
    let celcius = Math.round(temp - 273);

    const formattedTime = formatTimeFromShift(weatherResult.data.timezone);

    const iconLink = `https://openweathermap.org/img/wn/${weatherResult.data.weather[0].icon}.png`;

    res.render("weatherResult.ejs", {
      city: name,
      weather: weatherResult.data,
      temperatur: celcius,
      time: formattedTime,
      icon: iconLink,
    });
  } catch (error) {
    console.error(error.response.data);
    res.status(500).send("Error retrieving weather data.");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
