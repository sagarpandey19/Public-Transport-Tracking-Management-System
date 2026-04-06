const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const Route = require('./models/Route');
const Vehicle = require('./models/Vehicle');
const fs = require('fs');

async function audit() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const routes = await Route.find().lean();
  const vehicles = await Vehicle.find().lean();
  
  const lines = [];

  lines.push('ROUTES (' + routes.length + ')');
  lines.push('='.repeat(60));
  for (const r of routes) {
    const vCount = vehicles.filter(v => String(v.route) === String(r._id)).length;
    const status = vCount > 0 ? 'OK(' + vCount + ')' : 'NO_VEHICLES';
    lines.push(status + ' | ' + r.origin + ' -> ' + r.destination + ' | "' + r.name + '" | stops:' + (r.stops?.length || 0));
  }

  lines.push('');
  lines.push('VEHICLES (' + vehicles.length + ')');
  lines.push('='.repeat(60));
  for (const v of vehicles) {
    const matchedRoute = routes.find(r => String(r._id) === String(v.route));
    lines.push(v.model + ' (' + v.regNumber + ') -> ' + (matchedRoute ? matchedRoute.name : 'ORPHAN'));
  }

  const output = lines.join('\n');
  fs.writeFileSync('audit_result.txt', output);
  console.log('Written to audit_result.txt');

  await mongoose.disconnect();
}

audit().catch(e => { console.error(e.message); process.exit(1); });
