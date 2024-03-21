import express from 'express';
import {createClient} from '@supabase/supabase-js'
import morgan from 'morgan'
import bodyParser from "body-parser";
import cors from 'cors';

const now = new Date();
const port = 3000

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
  
  const { error } = await supabase
  .from('phLevels')
  .insert([
    { data: req.body.data },
  ])
  if(!error){
    return res.status(200).send("PH level data received");
  }
 
})

app.post('/addWaterLvl',async(req,res)=>{
  const { error } = await supabase
  .from('waterLevels')
  .insert([
    { data: req.body.data },
  ])
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
  app.get('/fetchSettings',async(req,res)=>{
    const { data:settings,error } = await supabase
    .from('user_settings')
    .select('*')

    if(!error){
      res.json(settings)
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
      res.json(tdsLevels)
    }
  })

  app.get('/fetchWaterLvl',async(req,res)=>{
    const { data: waterLevels, error } = await supabase
    .from('waterLevels')
    .select('*')
    if(!error){
      res.json(waterLevels)
    }
  })

  app.get('/fetchWaterTmp',async(req,res)=>{
    const { data: waterTemp, error } = await supabase
    .from('waterTemp')
    .select('*')
    if(!error){
      res.json(waterTemp)
    }
  })

  app.post('/getSettings',async(req,res)=>{
    
    let reading=await getSensorReading(req.body.sensor)
    let settings=await getUserSetting(req.body.sensor)
    if(settings[0].waterTemp > reading[0].data || settings[0].waterTemp < reading[0].data){
      console.log('Send Notif')
      return res.status(200).json({
        "notif":true
      })
    }
  //   let { data: user_settings, error } = await supabase
  // .from('user_settings')
  // .select(req.body.sensor)
  // .eq('id', '41')

  //   if(!error){
  //     res.json(user_settings);
  //   }
          
  })

  async function getSensorReading(table_name){
    
    const { data, error } = await supabase
    .from(table_name)
    .select('data')
    .order('id', { ascending: false })
    .limit(1)
    
    if(!error){
      return data
    }
  }

  async function getUserSetting(sensor){
    console.log(sensor)
    let { data: user_settings, error } = await supabase
    .from('user_settings')
    .select(sensor)
    .eq('id', '41')
  
      if(!error){
       return user_settings;
      }
  }

// app.get('/', (req, res) => {
// const doc = db.collection('phlevel').doc('one').set({data:'2023-12-19',level:1.0});
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
  if(supabase){
    console.log('Connected to Supabase')
  }
})