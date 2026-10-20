// สัตว์ทั้ง 8 ชนิด: area = พื้นที่ที่เจอได้ (null = ตัวเริ่มต้น)
export const ANIMALS = [
  {
    id: 'cat',
    name: 'ส้มจี๊ด',
    kind: 'แมวส้ม',
    area: null,
    bio: 'ชอบนอนตากแดด แต่พอได้ยินคำว่าขนมจะตื่นทันที',
  },
  {
    id: 'shiba',
    name: 'โมจิ',
    kind: 'หมาชิบะ',
    area: 'garden',
    bio: 'ขุดดินเก่งที่สุดในบ้าน หางกระดิกตลอดเวลา',
  },
  {
    id: 'rabbit',
    name: 'ปุยฝ้าย',
    kind: 'กระต่าย',
    area: 'garden',
    bio: 'ขี้อาย แต่จมูกไวมาก หาของซ่อนเจอทุกครั้ง',
  },
  {
    id: 'hamster',
    name: 'ข้าวปั้น',
    kind: 'แฮมสเตอร์',
    area: 'meadow',
    bio: 'เก็บเมล็ดพืชไว้ในแก้มได้ทีละเป็นสิบเม็ด',
  },
  {
    id: 'chick',
    name: 'ไข่หวาน',
    kind: 'ลูกเจี๊ยบ',
    area: 'meadow',
    bio: 'ร้องเพลงเจี๊ยบๆ ปลุกทุกคนตอนเช้า',
  },
  {
    id: 'fox',
    name: 'หางฟู',
    kind: 'จิ้งจอก',
    area: 'forest',
    bio: 'รู้ทางลัดในป่าทุกเส้น ภูมิใจในหางตัวเองมาก',
  },
  {
    id: 'redpanda',
    name: 'บราวนี่',
    kind: 'แพนด้าแดง',
    area: 'forest',
    bio: 'ปีนต้นไม้เก่ง ชอบกินผลไม้รสเปรี้ยว',
  },
  {
    id: 'penguin',
    name: 'น้ำแข็งใส',
    kind: 'เพนกวิน',
    area: 'snow',
    bio: 'มาจากภูเขาหิมะ ไถลตัวบนพื้นแทนการเดิน',
  },
];

export const STARTER_ID = 'cat';

export function getAnimal(id) {
  return ANIMALS.find((a) => a.id === id);
}
