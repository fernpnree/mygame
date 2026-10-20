// อาหาร: ซื้อในร้าน หรือได้จากการสำรวจ
export const FOODS = [
  {
    id: 'carrot',
    name: 'แครอทกรอบ',
    price: 20,
    energy: 25,
    mood: 5,
    desc: 'ของว่างราคาประหยัด',
  },
  {
    id: 'fruit',
    name: 'ผลไม้รวม',
    price: 60,
    energy: 50,
    mood: 10,
    desc: 'สดชื่น อิ่มท้อง',
  },
  {
    id: 'treat',
    name: 'ขนมพิเศษ',
    price: 150,
    energy: 100,
    mood: 30,
    desc: 'พลังงานเต็มหลอด แถมอารมณ์ดีสุดๆ',
  },
];

export function getFood(id) {
  return FOODS.find((f) => f.id === id);
}
