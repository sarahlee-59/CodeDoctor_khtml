import express, { Request, Response } from "express";
import cors from "cors";
import fs from "fs";

const app = express();
app.use(cors()); 
app.use(express.json());

type Store = { 
  id: number; 
  name: string; 
  category_std: string; 
  lat: number; 
  lng: number; 
  hours_json?: any 
};

type Location = {
  lat: number;
  lng: number;
};

type Waypoint = {
  category: string;
};

type PlanRequest = {
  start: Location;
  waypoints: Waypoint[];
};

type ParseRequest = {
  q?: string;
  start?: Location;
};

const STORES: Store[] = JSON.parse(fs.readFileSync("./data/stores.seed.json", "utf8"));

app.get("/healthz", (_: Request, res: Response) => res.send("ok"));

app.get("/stores/search", (req: Request, res: Response) => {
  const { category, lat, lng } = req.query;
  const near = STORES
    .filter(s => !category || s.category_std === category)
    .map(s => ({ ...s, d: Math.hypot((Number(lat) - s.lat), (Number(lng) - s.lng)) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 20);
  res.json({ items: near });
});

app.post("/plan", (req: Request<{}, {}, PlanRequest>, res: Response) => {
  // 입력: {start:{lat,lng}, waypoints:[{category: "카페"}, ...]}
  const { start, waypoints } = req.body || {};
  if (!start) {
    return res.status(400).json({ error: "start location is required" });
  }
  
  let cur: Location = start;
  const picks: Store[] = [];
  
  for (const step of (waypoints || [])) {
    const cand = STORES
      .filter(s => s.category_std === step.category)
      .map(s => ({ s, d: Math.hypot(cur.lat - s.lat, cur.lng - s.lng) }))
      .sort((a, b) => a.d - b.d)
      .map(x => x.s);
    
    const chosen = cand.find(c => !picks.find(p => p.id === c.id)) ?? cand[0];
    if (chosen) { 
      picks.push(chosen); 
      cur = { lat: chosen.lat, lng: chosen.lng }; 
    }
  }
  
  const path: Location[] = [start, ...picks.map(p => ({ lat: p.lat, lng: p.lng }))];
  res.json({ start, stops: picks, path });
});

app.post("/parse", (req: Request<{}, {}, ParseRequest>, res: Response) => {
  const q = String(req.body?.q || "");
  const has = (k: string) => q.includes(k);
  const waypoints: Waypoint[] = [];
  
  if (has("카페")) waypoints.push({ category: "카페" });
  if (has("마트")) waypoints.push({ category: "마트" });
  if (has("과일")) waypoints.push({ category: "과일가게" });
  if (has("디저트") || has("달콤")) waypoints.push({ category: "디저트" });
  if (!waypoints.length) waypoints.push({ category: "카페" }, { category: "디저트" });
  
  res.json({
    intent: "route",
    start: req.body?.start ?? { lat: 37.58, lng: 127.04 },
    area: "동대문구-전통시장",
    waypoints,
    constraints: { crowd: "low", when: "now", max_walk_km: 1.2 }
  });
});

app.listen(3000, () => console.log("api :3000"));