const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');

const coupons = [
  {
    code: 'WELCOME50',
    discountType: 'flat',
    discountValue: 50,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
    tag: 'WELCOME',
    minBookingAmount: 100,
  },
  {
    code: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    expiryDate: new Date('2027-06-30'),
    isActive: true,
    tag: 'SUMMER',
    maxDiscount: 200,
    minBookingAmount: 200,
  },
  {
    code: 'GROUP10',
    discountType: 'percentage',
    discountValue: 10,
    expiryDate: new Date('2027-12-31'),
    isActive: true,
    tag: 'COMBO',
    minSeats: 3,
    maxDiscount: 500,
  },
  {
    code: 'FLAT100',
    discountType: 'flat',
    discountValue: 100,
    expiryDate: new Date('2027-03-31'),
    isActive: true,
    minBookingAmount: 300,
    usageLimit: 50,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  
  for (const c of coupons) {
    const exists = await Coupon.findOne({ code: c.code });
    if (exists) {
      console.log('EXISTS: ' + c.code);
    } else {
      await Coupon.create(c);
      console.log('CREATED: ' + c.code + ' (' + c.discountType + ' ' + c.discountValue + ')');
    }
  }

  console.log('\nAll coupons:');
  const all = await Coupon.find();
  all.forEach(c => console.log('  ' + c.code + ' | ' + c.discountType + ':' + c.discountValue + ' | active:' + c.isActive + ' | expires:' + c.expiryDate.toISOString().split('T')[0]));

  await mongoose.disconnect();
}

seed().catch(e => { console.error(e.message); process.exit(1); });
