import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

if (!admin.apps.length) {
    try {
        // If you have a service account file, use it. Otherwise, use default credential for GCloud
        // For development, we might skip full init if keys aren't present yet
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
             const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
             admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
             console.warn("FIREBASE_SERVICE_ACCOUNT not found, skipping Admin SDK init");
        }
    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

export default admin;
