import { db } from './app/config/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { MOCK_DELIVERIES } from './app/data/mock';

async function seed() {
    console.log("Starting forced seed...");
    const batch = writeBatch(db);

    // Generate 15 items
    const seedData = Array.from({ length: 15 }).map((_, i) => {
        const mockTemplate = MOCK_DELIVERIES[i % MOCK_DELIVERIES.length];
        const docRef = doc(collection(db, 'deliveries'));

        return {
            ref: docRef,
            data: {
                ...mockTemplate,
                id: docRef.id,
                customerName: `${mockTemplate.customerName} ${i + 1}`,
                courierCode: Math.floor(100000 + Math.random() * 900000).toString(),
                customerCode: Math.floor(100000 + Math.random() * 900000).toString(),
                photoDeliveryRequested: false,
                photoDeliveryApproved: false,
                status: 'pending'
            }
        };
    });

    seedData.forEach(item => {
        batch.set(item.ref, item.data);
    });

    try {
        await batch.commit();
        console.log("SUCCESS: Database seeded with 15 records!");
    } catch (error) {
        console.error("ERROR: Could not seed database.", error);
    }
    process.exit();
}

seed();
