import express from 'express';
import {createClient} from '@supabase/supabase-js'
import morgan from 'morgan'
import bodyParser from "body-parser";
import cors from 'cors';


var curr = new Date; // get current date
var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
var last = first + 6; // last day is the first day + 6

var firstday = new Date(curr.setDate(first)).toISOString();
var lastday = new Date(curr.setDate(last)).toISOString();

const port = 3500

const app = express();

app.use(morgan('combined'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

const supabaseUrl = 'https://dgskmuaxbopqtdnkjiiy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2ttdWF4Ym9wcXRkbmtqaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1MTk0NTYsImV4cCI6MjAyMDA5NTQ1Nn0.PKMUsvv2lLpoR_32zLuBfzRIbLFHEUVDgw6-co8JZo0'
const supabase = createClient(supabaseUrl,supabaseAnonKey);

app.get("/api",(req,res)=>{
  res.status(200).send("Api Connected");
})

app.post('/addPhLvl',async(req,res)=>{
  
  
  // const data = await getPlusMinusPhLvl().then(function(result){ return result.plusMinus})
  let phLvlData = +req.body.data 

  const { error } = await supabase
  .from('phLevels')
  .insert([
    { data: phLvlData },
  ])
  console.log(error)
  if(!error){
    return res.status(200).send("PH level data received");
  }
 
})

app.post('/addwaterLevels',async(req,res)=>{
  console.log(req.body.data)
  const { error } = await supabase
  .from('waterLevels')
  .insert([
    { data: req.body.data },
  ])
  console.log(error)
  
  if(!error){
    res.status(200).send("Water level data received");
  }
 })

 app.post('/addWaterTmp',async(req,res)=>{
  console.log(req.body)
  const { error } = await supabase
.from('waterTemp')
.insert([
  { data: req.body.data },
])
console.log(error)
if(!error){
  res.status(200).send("Water Temp data received");
}
 })

 app.post('/addTdslvl',async(req,res)=>{
  
const { error } = await supabase
.from('tdsLevels')
.insert([
  { data: req.body.data },
])

if(!error){
  res.status(200).send("Tds lvl data received");
}
        
 })

 app.post('/addSettings',async(req,res)=>{
  
    const { data:settings,error } = await supabase
    .from('user_settings')
    .upsert([
      { 
        id:41,
        phLevels: [req.body.selectedHigh,req.body.selectedLow],
        tdsLevels:req.body.tdsLevel, 
        waterTemp:req.body.waterTemp, 
        waterLevels:req.body.waterLevel,
        plusMinus:req.body.settingplusMinusData
      },
    ]).select('*')

    if(!error){
      res.json(settings);
    }
          
  })


  app.get('/fetchPhLvl',async(req,res)=>{
    const { data: phLevels, error } = await supabase
    .from('phLevels')
    .select('*')

    if(!error){
      res.status(200).json(phLevels)
    }
  })

  app.get('/fetchTdsLvl',async(req,res)=>{
    const { data: tdsLevels, error } = await supabase
    .from('tdsLevels')
    .select('*')
    if(!error){
      res.status(200).json(tdsLevels)
    }
  })

  app.get('/fetchWaterLvl',async(req,res)=>{
    const { data: waterLevels, error } = await supabase
    .from('waterLevels')
    .select('*')
    if(!error){
      res.status(200).json(waterLevels)
    }
  })

  app.get('/fetchWaterTmp',async(req,res)=>{
    const { data: waterTemp, error } = await supabase
    .from('waterTemp')
    .select('*')
    if(!error){
      res.status(200).json(waterTemp)
    }
  })

  app.post('/getSettings',async(req,res)=>{
    let reading=await getSensorReading(req.body.sensor)
    let settings=await getUserSetting(req.body.sensor)
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
          
  })

  async function getPlusMinusPhLvl(){
    
    const { data, error } = await supabase
    .from('user_settings')
    .select('plusMinus')
    .single();
    
    if(!error){
     return data
    }
  }

  async function getUserSetting(sensor){

    let { data: user_settings, error } = await supabase
    .from('user_settings')
    .select(sensor)
    .eq('id', '41')
  
      if(!error){
        res.status(200).json(user_settings);
      }
  }

// app.get('/', (req, res) => {
// const doc = db.collection('phlevel').doc('one').set({data:'2023-12-19',level:1.0});
//   res.send('Hello World!')
// })
function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

app.get('/getPhLvlStat',async(req,res)=>{
  console.log('this')
  let { data, error } = await supabase
    .from('phLevels')
    .select('data')
    .limit(5)
 
    if(!error){
      res.status(200).json(data);
    }
})
app.get('/getTDSLvlStat',async(req,res)=>{
  let { data, error } = await supabase
    .from(req.body.tblName)
    .select('data')
    .order('created_at', { ascending: false })
    .limit(1)

    if(!error){
      res.status(200).json(data);
    }
})

app.get('/getWaterLvlStat',async(req,res)=>{
  let { data, error } = await supabase
    .from(req.body.tblName)
    .select('data')
    .order('created_at', { ascending: false })
    .limit(1)

    if(!error){
      res.status(200).json(data);
    }
})

app.get('/getWaterTempStat',async(req,res)=>{
  let { data, error } = await supabase
    .from(req.body.tblName)
    .select('data')
    .order('created_at', { ascending: false })
    .limit(1)

    if(!error){
      res.status(200).json(data);
    }
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  if(supabase){
    console.log('Connected to Supabase')
  }
})