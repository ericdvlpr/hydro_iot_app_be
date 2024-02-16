import express from 'express';
import {createClient} from '@supabase/supabase-js'
import morgan from 'morgan'
import bodyParser from "body-parser";
const now = new Date();
const port = process.env.PORT || 3000

const app = express();

app.use(morgan('combined'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const supabaseUrl = 'https://dgskmuaxbopqtdnkjiiy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnc2ttdWF4Ym9wcXRkbmtqaWl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ1MTk0NTYsImV4cCI6MjAyMDA5NTQ1Nn0.PKMUsvv2lLpoR_32zLuBfzRIbLFHEUVDgw6-co8JZo0'
const supabase = createClient(supabaseUrl,supabaseAnonKey);

app.post('/addPhLvl',async(req,res)=>{
  
  const { error } = await supabase
  .from('phLevels')
  .insert([
    { data: req.body.data },
  ])
  if(error){
    console.log(error)
  }
  return res.status(200)
})

app.post('/addWaterLvl',async(req,res)=>{
  const { error } = await supabase
  .from('waterLevels')
  .insert([
    { data: req.body.data },
  ])
  if(!error){
    res.status(200)
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
  res.status(200)
}
 })

 app.post('/addTdslvl',async(req,res)=>{
  
const { error } = await supabase
.from('tdsLevels')
.insert([
  { data: req.body.data },
])
if(!error){
  res.status(200)
}
        
 })

// app.get('/', (req, res) => {
// const doc = db.collection('phlevel').doc('one').set({data:'2023-12-19',level:1.0});
//   res.send('Hello World!')
// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})