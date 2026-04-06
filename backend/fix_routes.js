const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const Route = require('./models/Route');
const Vehicle = require('./models/Vehicle');

const newVehicles = [
  // For "Jalandhar → Delhi (Via Ludhiana)"
  { regNumber: 'PB08F2001', model: 'Volvo 9600', capacity: 48, driverName: 'Rajesh Kumar' },
  { regNumber: 'PB08F2002', model: 'Tata Marcopolo', capacity: 44, driverName: 'Sunil Verma' },

  // For "Delhi → Amritsar (Via Jalandhar)"
  { regNumber: 'DL02G3001', model: 'Scania Metrolink HD', capacity: 50, driverName: 'Harpreet Singh' },
  { regNumber: 'DL02G3002', model: 'Mercedes Tourismo', capacity: 45, driverName: 'Amit Sharma' },

  // For "Delhi → Chandigarh Express"
  { regNumber: 'DL04H4001', model: 'Volvo B11R', capacity: 44, driverName: 'Pankaj Gupta' },
  { regNumber: 'DL04H4002', model: 'Ashok Leyland Viking', capacity: 52, driverName: 'Rahul Mehra' },

  // For "Chandigarh → Manali"
  { regNumber: 'CH05I5001', model: 'Force Traveller', capacity: 36, driverName: 'Vikram Thakur' },
  { regNumber: 'CH05I5002', model: 'Volvo B9R', capacity: 44, driverName: 'Deepak Chauhan' },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const routes = await Route.find().lean();
  const routeMap = {};
  routes.forEach(r => { routeMap[r.origin + '->' + r.destination] = r._id; });

  const assignments = [
    { key: 'Jalandhar->Delhi', vehicles: [newVehicles[0], newVehicles[1]] },
    { key: 'Delhi->Amritsar', vehicles: [newVehicles[2], newVehicles[3]] },
    { key: 'Delhi->Chandigarh', vehicles: [newVehicles[4], newVehicles[5]] },
    { key: 'Chandigarh->Manali', vehicles: [newVehicles[6], newVehicles[7]] },
  ];

  for (const a of assignments) {
    const routeId = routeMap[a.key];
    if (!routeId) {
      console.log('SKIP: Route not found for ' + a.key);
      continue;
    }

    for (const v of a.vehicles) {
      const exists = await Vehicle.findOne({ regNumber: v.regNumber });
      if (exists) {
        console.log('EXISTS: ' + v.regNumber + ' — updating route');
        await Vehicle.updateOne({ regNumber: v.regNumber }, { route: routeId });
      } else {
        await Vehicle.create({ ...v, route: routeId, status: 'active' });
        console.log('CREATED: ' + v.model + ' (' + v.regNumber + ') -> ' + a.key);
      }
    }
  }

  // Fix orphan vehicle: assign it to a valid route or remove it
  const orphan = await Vehicle.findOne({ regNumber: 'KBKY567' });
  if (orphan) {
    const validRoute = routes[0]; // Assign to first route
    if (validRoute) {
      await Vehicle.updateOne({ regNumber: 'KBKY567' }, { route: validRoute._id });
      console.log('FIXED ORPHAN: KBKY567 -> ' + validRoute.name);
    }
  }

  // Verify
  console.log('\n--- VERIFICATION ---');
  const allRoutes = await Route.find().lean();
  const allVehicles = await Vehicle.find().lean();
  for (const r of allRoutes) {
    const count = allVehicles.filter(v => String(v.route) === String(r._id)).length;
    console.log((count > 0 ? 'OK' : 'STILL EMPTY') + ' | ' + r.origin + ' -> ' + r.destination + ' | vehicles: ' + count);
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

seed().catch(e => { console.error(e.message); process.exit(1); });
