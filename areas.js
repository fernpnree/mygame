// พื้นที่สำรวจ 4 แห่ง เรียงจากง่ายไปยาก
// drops: โอกาสได้อาหารแต่ละชนิดต่อการสำรวจ 1 รอบ
export const AREAS = [
  {
    id: 'garden',
    name: 'สวนหลังบ้าน',
    desc: 'สนามหญ้าเล็กๆ หลังบ้าน มีของหล่นอยู่ตามพุ่มไม้',
    minutes: 1,
    energy: 15,
    coins: 12,
    exp: 5,
    unlockCost: 0,
    reqLevel: 1,
    drops: { carrot: 0.3 },
  },
  {
    id: 'meadow',
    name: 'ทุ่งดอกไม้',
    desc: 'ทุ่งกว้างสีชมพูกับเมล็ดพืชเต็มไปหมด',
    minutes: 5,
    energy: 25,
    coins: 50,
    exp: 12,
    unlockCost: 150,
    reqLevel: 1,
    drops: { carrot: 0.4, fruit: 0.15 },
  },
  {
    id: 'forest',
    name: 'ป่าเห็ด',
    desc: 'ป่าร่มรื่นที่มีเห็ดยักษ์ เดินลึกเข้าไปต้องใช้แรงเยอะ',
    minutes: 20,
    energy: 40,
    coins: 180,
    exp: 30,
    unlockCost: 800,
    reqLevel: 3,
    drops: { fruit: 0.35, treat: 0.1 },
  },
  {
    id: 'snow',
    name: 'ภูเขาหิมะ',
    desc: 'ยอดเขาหนาวเหน็บ มีสมบัติซ่อนอยู่ใต้หิมะ',
    minutes: 60,
    energy: 60,
    coins: 500,
    exp: 80,
    unlockCost: 3000,
    reqLevel: 5,
    drops: { fruit: 0.3, treat: 0.3 },
  },
];

export function getArea(id) {
  return AREAS.find((a) => a.id === id);
}
