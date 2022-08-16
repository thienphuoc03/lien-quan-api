const express = require("express");
const cors = require("cors");
// const bodyParser = require("body-parser"); //built in new version express
const axios = require("axios"); //node version 18 support fetch
const cheerio = require("cheerio");
const dotenv = require("dotenv");

const url = "https://lienquan.garena.vn/tuong";
const characterUrl = "https://lienquan.garena.vn/tuong-chi-tiet/";

// Load environment variables from .env file
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());
dotenv.config();
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// Get all the data from the website
app.get("/api/lienquan", (req, resp) => {
  const thumnails = [];
  const limit = Number(req.query.limit);

  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);

      $(".list-champion").each(function () {
        const name = $(this).find("p").attr("data-name");
        const url = $(this).find("a").attr("href");
        const image = $(this).find("a > img").attr("src");

        thumnails.push({
          name: name,
          url:
            "http://localhost:8000/api/lienquan" +
            url.split("/tuong-chi-tiet")[1],
          image: "https://lienquan.garena.vn" + image,
        });
      });
      if (limit && limit > 0) {
        resp.status(200).json(thumnails.slice(0, limit));
      } else {
        resp.status(200).json(thumnails);
      }
    });
  } catch (error) {
    resp.status(500).json(error);
  }
});

// Get detail of a character
app.get("/api/lienquan/:id", (req, resp) => {
  let url = characterUrl + req.params.id;

  const skinId = [];
  const skinImg = [];
  const skinObj = {};
  const skins = [];

  const titles = [];
  const championStat = [];
  const numeralObj = {};
  const numerals = [];

  const skills = [];

  const detailCharacter = [];

  try {
    axios(url).then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);

      // Get skins
      $(".cont-skin").each(function () {
        // Get skin id
        $(this)
          .find(".tabs-content-skin")
          .each(function () {
            skinId.push($(this).attr("id"));
          });

        // Get skin image
        $(this)
          .find(".tabs-content-skin > img")
          .each(function () {
            skinImg.push($(this).attr("src"));
          });

        for (let i = 0; i < skinId.length; i++) {
          skinObj[skinId[i]] = "https://lienquan.garena.vn" + skinImg[i];
        }
        //   skins.push(...skinObj);
      });

      // Get Numberals
      $(".bxnumeral").each(function () {
        // Get title of the character
        $(this)
          .find(".cont > .col > p > label")
          .each(function () {
            titles.push($(this).text());
          });

        // Get championStat of the character
        $(this)
          .find(".cont > .col > p > span")
          .each(function () {
            championStat.push($(this).text());
          });

        for (let i = 0; i < titles.length; i++) {
          numeralObj[titles[i]] = championStat[i];
        }
        // numerals.push(...numeralObj);
      });

      // Get skills of the character
    //   $("cont-skill").each(function () {
    //     $(this).find(".col-skill")
    //   });

      detailCharacter.push({
        skins: skinObj,
        numerals: numeralObj,
      });

      resp.status(200).json(detailCharacter);
    });
  } catch (error) {
    resp.status(500).json(error);
  }
});

// Post data to the database
app.listen(process.env.PORT || 8000, () => {
  console.log("Server is running on port 8000");
});
