# คู่มือการ Deploy ร้านป้ายไวนิลขึ้น Vercel

## ขั้นตอนที่ 1: เตรียม Database
1. สมัครบัญชีที่ [Neon](https://neon.tech)
2. สร้าง database ใหม่
3. คัดลอก Connection string
4. รันคำสั่ง setup database:
   ```bash
   npm run setup-db
   ```

## ขั้นตอนที่ 2: Deploy ขึ้น Vercel

### วิธีที่ 1: ผ่าน Vercel CLI (แนะนำ)
```bash
# 1. ติดตั้ง Vercel CLI
npm i -g vercel

# 2. Login ใน Vercel
vercel login

# 3. Deploy ครั้งแรก
vercel

# 4. ตั้งค่า Environment Variables
vercel env add DATABASE_URL

# 5. Deploy อีกครั้งเพื่อใช้ env variables
vercel --prod
```

### วิธีที่ 2: ผ่าน GitHub (แนะนำสำหรับ team)
1. Push code ขึ้น GitHub
2. ไปที่ [vercel.com](https://vercel.com)
3. Import project จาก GitHub
4. เชื่อมต่อกับ Neon database
5. Add Environment Variables:
   - `DATABASE_URL`: Connection string จาก Neon

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables ใน Vercel
ไปที่ Project Settings → Environment Variables และเพิ่ม:
- `DATABASE_URL`: postgresql://... (จาก Neon)
- `NEXTAUTH_SECRET`: สร้าง random string (ถ้าจะใช้ auth)

## ขั้นตอนที่ 4: Custom Domain (ถ้าต้องการ)
1. ไปที่ Project Settings → Domains
2. เพิ่ม domain ของคุณ
3. ตั้งค่า DNS records ตามที่ Vercel แนะนำ

## ขั้นตอนที่ 5: Production Check
- เช็คว่า database เชื่อมต่อได้
- ทดสอบสร้าง order ใหม่
- ตรวจสอบการทำงานของทุกฟีเจอร์

## หมายเหตุ
- Vercel ให้บริการฟรีสำหรับ personal projects
- Neon ให้บริการฟรี 0.5GB (เพียงพอสำหรับเริ่มต้น)
- อย่าลืม backup database ประจำ
