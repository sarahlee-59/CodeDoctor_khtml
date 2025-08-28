import express from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors()); app.use(express.json());

type Store = { id:number; name:string; category_std:string; lat:number; lng:number; hours_json?:any };
const STORES: Store[] = JSON.parse(fs.readFileSync("./data/stores.seed.json","utf8"));

app.get("/healthz", (_,res)=>res.send("ok"));

app.get("/stores/search", (req,res)=>{
  const { category, lat, lng } = req.query as any;
  const near = STORES
    .filter(s => !category || s.category_std===category)
    .map(s => ({...s, d: Math.hypot((+lat - s.lat), (+lng - s.lng))}))
    .sort((a,b)=>a.d-b.d).slice(0,20);
  res.json({items: near});
});

app.post("/plan", (req,res)=>{
  // 입력: {start:{lat,lng}, waypoints:[{category: "카페"}, ...]}
  const { start, waypoints } = req.body || {};
  let cur = start;
  const picks: Store[] = [];
  for (const step of (waypoints||[])) {
    const cand = STORES
      .filter(s => s.category_std===step.category)
      .map(s => ({ s, d: Math.hypot(cur.lat - s.lat, cur.lng - s.lng) }))
      .sort((a,b)=>a.d-b.d).map(x=>x.s);
    const chosen = cand.find(c => !picks.find(p=>p.id===c.id)) ?? cand[0];
    if (chosen) { picks.push(chosen); cur = {lat: chosen.lat, lng: chosen.lng}; }
  }
  const path = [start, ...picks.map(p=>({lat:p.lat,lng:p.lng}))];
  res.json({ start, stops: picks, path });
});

app.listen(3000, ()=>console.log("api :3000"));