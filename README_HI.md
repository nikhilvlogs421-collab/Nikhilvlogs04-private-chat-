# Private Chat — Firebase

## 1. Firebase project
Firebase Console me project banayein, Web App register karein, aur `app.js` ke `firebaseConfig` ko apne config se replace karein.

## 2. Firestore
Firestore Database create karein aur `firestore.rules` ki rules paste/publish karein.

## 3. Storage
Firebase Storage enable karein aur `storage.rules` ki rules paste/publish karein.

## 4. Run
Firebase Hosting ya kisi HTTPS static hosting par files upload karein. Firebase docs ke mutabik local development ke liye Firebase CLI/server use karna convenient hai.

## 5. Use
Naya private room banayein -> "Link copy" -> friend ko link bhejein. Friend link kholkar naam enter karega aur same room me chat karega.

### Important privacy note
Ye basic private-room app hai, end-to-end encrypted messenger nahi. Jiske paas room link hai, woh room data access kar sakta hai. Production use ke liye Firebase Authentication, stronger room membership rules, abuse limits aur moderation/security hardening add karein.
