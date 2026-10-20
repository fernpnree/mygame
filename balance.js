// ตัวเลขสมดุลเกมทั้งหมดอยู่ที่ไฟล์นี้ ปรับที่นี่ที่เดียว
export const BALANCE = {
  startCoins: 50,

  maxEnergy: 100,
  energyRegenPerMin: 1 / 1.5, // +1 ทุก 90 วินาที (เต็มจาก 0 ใน ~2.5 ชม.)

  maxMood: 100,
  startMood: 90,
  moodLossPerExpedition: 10,
  moodRegenPerMin: 0.2, // +12 ต่อชั่วโมงเมื่ออยู่บ้าน
  moodHappyAt: 70,
  moodSadBelow: 30,
  moodMultiplier: { happy: 1.25, normal: 1, sad: 0.6 },

  maxLevel: 10,
  levelBonus: 0.1, // รางวัล +10% ต่อเลเวลที่เกิน 1
  // EXP ที่ต้องใช้จากเลเวล n ไป n+1 (index = เลเวลปัจจุบัน)
  expToNext: [0, 20, 40, 70, 110, 160, 220, 300, 400, 520],

  rewardSpread: 0.1, // เหรียญจริงสุ่ม ±10% จากค่าประมาณ
  teamMax: 3,

  discoverBase: 0.2,
  discoverPity: 0.1, // +10% ทุกครั้งที่ไปพื้นที่นั้นแล้วไม่เจอ

  piggyPerMinPerAnimal: 0.25,
  piggyMaxHours: 8,

  beds: [
    { level: 0, name: 'เบาะธรรมดา', mult: 1, cost: 0 },
    { level: 1, name: 'ที่นอนนุ่มฟู', mult: 1.5, cost: 300 },
    { level: 2, name: 'ที่นอนเมฆปุย', mult: 2, cost: 1000 },
    { level: 3, name: 'ที่นอนดาวนิ่ม', mult: 3, cost: 3000 },
  ],

  baseSlots: 1,
  maxSlots: 2,
  extraSlotCost: 500,

  // ไม่จำลองตอนไม่อยู่เกินนี้ (ถึงตอนนั้นทุกอย่างเต็มหมดแล้ว)
  maxCatchUpHours: 48,
  welcomeBackAfterMin: 2,
};
