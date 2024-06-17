import express from "express";
import { createClient } from "@supabase/supabase-js";
import morgan from "morgan";
import bodyParser from "body-parser";
import cors from "cors";
import { Expo } from "expo-server-sdk";
import { CronJob } from "cron";

const expo = new Expo();
var curr = new Date(); // get current date
var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
var last = first + 6; // last day is the first day + 6

var firstday = new Date(curr.setDate(first)).toISOString();
var lastday = new Date(curr.setDate(last)).toISOString();

const port = 3500;

const app = express();

app.use(morgan("combined"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const supabaseUrl = "https://dgskmuaxbopqtdnkjiiy.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2ttdWF4Ym9wcXRkbmtqaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1MTk0NTYsImV4cCI6MjAyMDA5NTQ1Nn0.PKMUsvv2lLpoR_32zLuBfzRIbLFHEUVDgw6-co8JZo0";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let token, phLvldata, tdslvldata, watertempdata, waterlvldata;

app.get("/getExpoToken", async (req, res) => {
  console.log(req.query.usertoken);
  const { data: settings, error } = await supabase
    .from("user_token")
    .upsert([
      {
        id: 52,
        token: req.query.usertoken,
      },
    ])
    .select("token");
  if (!error) {
    token = settings[0]["token"];
    console.log("return", token);
    res.status(200).send("Token Received:");
  }
});
app.get("/api", (req, res) => {
  res.status(200).send("Api Connected");
  // sendNotif()
});

// console.log(token)
app.post("/addPhLvl", async (req, res) => {
  const data = await getPlusMinusPhLvl().then(function (result) {
    return result.plusMinus;
  });
  let phLvlData = +req.body.data + data;

  const { data: latestData, error } = await supabase
    .from("phLevels")
    .insert([{ data: phLvlData }])
    .select("data");

  let settingData = await getUserSetting("phLevels");
  if (
    !(
      settingData[0]["phLevels"][0] >= latestData[0]["data"] &&
      settingData[0]["phLevels"][1] <= latestData[0]["data"]
    )
  ) {
    await sendNotif("Phlvl Notif", "Abnormal readings detected for PHlvl");
  }

  if (!error) {
    return res.status(200).send("PH level data received");
  }
});

app.post("/addwaterLevels", async (req, res) => {
  const { data: latestData, error } = await supabase
    .from("waterLevels")
    .insert([{ data: req.body.data }])
    .select("data");
    let settingData = await getUserSetting("waterLevels");
  if (
    !(
      settingData[0]["waterLevels"][0] >= latestData[0]["data"] &&
      settingData[0]["waterLevels"][1] <= latestData[0]["data"]
    ) == false
  ) {
    console.log("WaterLevel notification sent");
    sendNotif("WaterLevel Notif", "Abnormal readings detected for WaterLevel");
  }
  if (!error) {
    res.status(200).send("Water level data received");
  }
});

app.post("/addWaterTmp", async (req, res) => {
  const { data: latestData, error } = await supabase
    .from("waterTemp")
    .insert([{ data: req.body.data }])
    .select("data");

    let settingData = await getUserSetting("waterTemp");
  if (
    !(
      settingData[0]["waterTemp"][0] >= latestData[0]["data"] &&
      settingData[0]["waterTemp"][1] <= latestData[0]["data"]
    ) == false
  ) {
    sendNotif("WaterTemp Notif", "Abnormal readings detected for WaterTemp");
  }
  if (!error) {
    res.status(200).send("Water Temp data received");
  }
});

app.post("/addTdslvl", async (req, res) => {
  
  const data = await getTdsPlusMinusPhLvl().then(function (result) {
    return result.tdsplusMinus;
  });
  let tdsLvlData = +req.body.data + data;
  console.log(req.body.data + data)
  const { data: latestData, error } = await supabase
    .from("tdsLevels")
    .insert([{ data: tdsLvlData }])
    .select("data");


    let settingData = await getUserSetting("tdsLevels");
  if (
    !(
      settingData[0]["tdsLevels"][0] >= latestData[0]["data"] &&
      settingData[0]["tdsLevels"][1] <= latestData[0]["data"]
    ) == false
  ) {
    sendNotif("TdsLevel Notif", "Abnormal readings detected for Tds level");
  }
  if (!error) {
    res.status(200).send("Tds lvl data received");
  }
});

app.put("/addSettings", async (req, res) => {
  const { data: settings, error } = await supabase
    .from("user_settings")
    .upsert([
      {
        id: 41,
        phLevels: req.body[0].phLevels,
        tdsLevels: req.body[0].tdsLevels,
        waterTemp: req.body[0].waterTemp,
        waterLevels: req.body[0].waterLevels,
        plusMinus: req.body[0].plusMinus,
        tdsplusMinus: req.body[0].tdsPlusMinus,
      },
    ])
    .select("*");

  if (!error) {
    res.json(settings);
  }
});

app.get("/fetchPhLvl", async (req, res) => {
  const { data: phLevels, error } = await supabase.from("phLevels").select("*");

  if (!error) {
    res.status(200).json(phLevels);
  }
});

app.get("/fetchTdsLvl", async (req, res) => {
  const { data: tdsLevels, error } = await supabase
    .from("tdsLevels")
    .select("*");
  if (!error) {
    res.status(200).json(tdsLevels);
  }
});

app.get("/fetchWaterLvl", async (req, res) => {
  const { data: waterLevels, error } = await supabase
    .from("waterLevels")
    .select("*");
  if (!error) {
    res.status(200).json(waterLevels);
  }
});

app.get("/fetchWaterTmp", async (req, res) => {
  const { data: waterTemp, error } = await supabase
    .from("waterTemp")
    .select("*");
  if (!error) {
    res.status(200).json(waterTemp);
  }
});

app.post("/getSettings", async (req, res) => {
  let reading = await getSensorReading(req.body.sensor);
  let settings = await getUserSetting(req.body.sensor);
  // console.log(reading)
  // console.log(settings)

  // if(settings[0].waterTemp > reading[0].data || settings[0].waterTemp < reading[0].data){
  //   console.log('Send Notif')
  //   return res.status(200).json({
  //     "notif":true
  //   })
  // }
  //   let { data: user_settings, error } = await supabase
  // .from('user_settings')
  // .select(req.body.sensor)
  // .eq('id', '41')

  //   if(!error){
  //     res.json(user_settings);
  //   }
});
async function checkSettings() {
  let { data: user_settings, error } = await supabase
    .from("user_settings")
    .select("*")
    .limit(1);
  try {
  } catch (e) {
    console.log("notif error", e);
  }
}
async function getPlusMinusPhLvl() {
  const { data, error } = await supabase
    .from("user_settings")
    .select("plusMinus")
    .single();

  if (!error) {
    return data;
  }
}

async function getTdsPlusMinusPhLvl() {
  const { data, error } = await supabase
    .from("user_settings")
    .select("tdsplusMinus")
    .single();

  if (!error) {
    return data;
  }
}

async function getUserSetting(sensor) {
  let { data: user_settings, error } = await supabase
    .from("user_settings")
    .select(sensor)
    .eq("id", "41")
    .limit(1);
  if (!error) {
    return user_settings;
  }
}

// app.get('/', (req, res) => {
// const doc = db.collection('phlevel').doc('one').set({data:'2023-12-19',level:1.0});
//   res.send('Hello World!')
// })
function formatDate(date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

async function getLatestData(tblName) {
  let { data, error } = await supabase
    .from(tblName)
    .select("data")
    .order("created_at", { ascending: false })
    .limit(1);

  if (!error) {
    return data;
  }
}

//cronjob
// new CronJob(
//   "* */30  * * * *",
//   async function () {
//     console.log('every 30 mins')
//     if(await getLatestData('phLevels')){
//       let sent = false
//       let latestData = await getLatestData('phLevels')
//       let settingData = await getUserSetting('phLevels')
//       if((settingData[0]['phLevels'][0] >= latestData[0]['data'] && settingData[0]['phLevels'][1] <= latestData[0]['data'])==false){

//         if(!sent){
//           console.log('Phlvl notification sent')
//           // sendNotif('Phlvl Notif','Abnormal readings detected for PHlvl')
//           sent=true
//         }

//       }
//     }
// if(await getLatestData('waterLevels')){
//   let sent = false
//   let latestData = await getLatestData('waterLevels')
//   let settingData = await getUserSetting('waterLevels')
//   if((settingData[0]['waterLevels'][0] >= latestData[0]['data'] && settingData[0]['waterLevels'][1] <= latestData[0]['data'])==false){

//     if(!sent){
//       console.log('WaterLevel notification sent')
//       // sendNotif('WaterLevel Notif','Abnormal readings detected for WaterLevel')
//       sent=true
//     }
//   }
// }

// if(await getLatestData('waterTemp')){
//   let sent = false
//   let latestData = await getLatestData('waterTemp')
//   let settingData = await getUserSetting('waterTemp')
//   if((settingData[0]['waterTemp'][0] >= latestData[0]['data'] && settingData[0]['waterTemp'][1] <= latestData[0]['data'])==false){

//     if(!sent){
//       console.log('WaterTemp notification sent')
//       // sendNotif('WaterTemp Notif','Abnormal readings detected for WaterTemp')
//       sent=true
//     }

//   }
// }
// if(await getLatestData('tdsLevels')){
//   let sent = false
//   let latestData = await getLatestData('tdsLevels')
//   let settingData = await getUserSetting('tdsLevels')
//   if((settingData[0]['tdsLevels'][0] >= latestData[0]['data'] && settingData[0]['tdsLevels'][1] <= latestData[0]['data'])==false){
//     if(!sent){
//       console.log('TdsLevel notification sent')
//       // sendNotif('TdsLevel Notif','Abnormal readings detected for Tds level')
//       sent=true
//     }

//   }
// }

// if(!(user_settings[0]['waterTemp'][0] >= lastWaterTmpData && user_settings[0]['waterTemp'][1] <= lastWaterTmpData)){
//   schedulePushNotification('WaterTemp Notif','Abnormal readings detected for WaterTemp Low:'+user_settings[0]['waterTemp'][0]+'High:'+user_settings[0]['waterTemp'][1])
// }

// if(!(user_settings[0]['phLevels'][0] >= lastPhData && user_settings[0]['phLevels'][1] <= lastPhData)){
//   schedulePushNotification('Phlvl Notif','Abnormal readings detected for PHlvl Low:'+user_settings[0]['phLevels'][0]+'High:'+user_settings[0]['phLevels'][1])
// }
//   },
//   null,
//   false, //start
//   "Singapore"
// );
async function sendNotif(title, content) {
  let { data, error } = await supabase.from("user_token").select("token");
  console.log("Notif Sent:", title);
  if (!error) {
    if (data[0]["token"]) {
      expo.sendPushNotificationsAsync([
        {
          to: data[0]["token"],
          title: title,
          body: content,
        },
      ]);
    }
  }
}
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  if (supabase) {
    console.log("Connected to Supabase");
  }
});
