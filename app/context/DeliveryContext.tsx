import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_DELIVERIES, Delivery } from '../data/mock';
import { db } from '../config/firebase';
import { collection, onSnapshot, doc, updateDoc, writeBatch, getDocs, query, orderBy } from 'firebase/firestore';

// Extended Delivery type with verification codes
export interface ExtendedDelivery extends Delivery {
    courierCode: string;
    customerCode: string;
    photoDeliveryRequested?: boolean;
    photoDeliveryApproved?: boolean;
    isCourierVerified?: boolean;
    isCustomerVerified?: boolean;
}

interface DeliveryContextType {
    deliveries: ExtendedDelivery[];
    verifyDeliveryByCustomer: (id: string, inputCode: string) => Promise<boolean>;
    verifyDeliveryByCourier: (id: string, inputCode: string) => Promise<boolean>;
    requestPhotoDelivery: (id: string) => Promise<void>;
    approvePhotoDelivery: (id: string) => Promise<void>;
    cancelPhotoDelivery: (id: string) => Promise<void>;
    verifyDeliveryByPhoto: (id: string) => Promise<void>;
    seedDatabase: () => Promise<void>;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: ReactNode }) {
    const [deliveries, setDeliveries] = useState<ExtendedDelivery[]>([]);

    // Subscribe to Firestore updates
    useEffect(() => {
        const q = query(collection(db, 'deliveries'), orderBy('customerName', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ExtendedDelivery));
            setDeliveries(data);
        });

        // Auto-seed if empty
        seedDatabase();

        return () => unsubscribe();
    }, []);

    const seedDatabase = async () => {
        const q = query(collection(db, 'deliveries'));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            console.log("Database already has data. Skipping seed.");
            return;
        }

        console.log("Seeding database...");
        const batch = writeBatch(db);

        // Use MOCK_DELIVERIES as base, but generate fresh random data for 10-15 items
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
                    isCourierVerified: false,
                    isCustomerVerified: false,
                    status: 'pending'
                }
            };
        });

        seedData.forEach(item => {
            batch.set(item.ref, item.data);
        });

        await batch.commit();
        console.log("Database seeded with 15 records!");
    };

    const verifyDeliveryByCustomer = async (id: string, inputCode: string): Promise<boolean> => {
        const delivery = deliveries.find(d => d.id === id);
        console.log(`[Customer Verify] ID: ${id}, Input: ${inputCode}, Stored: ${delivery?.courierCode}`);

        // Compare as strings to be safe
        if (delivery && String(delivery.courierCode) === inputCode) {
            console.log("[Customer Verify] Success!");
            const updates: any = { isCustomerVerified: true };
            if (delivery.isCourierVerified) {
                updates.status = 'delivered';
            }
            await updateDoc(doc(db, 'deliveries', id), updates);
            return true;
        }
        console.log("[Customer Verify] Failed - Mismatch or Not Found");
        return false;
    };

    const verifyDeliveryByCourier = async (id: string, inputCode: string): Promise<boolean> => {
        const delivery = deliveries.find(d => d.id === id);
        console.log(`[Courier Verify] ID: ${id}, Input: ${inputCode}, Stored: ${delivery?.customerCode}`);

        // Compare as strings to be safe
        if (delivery && String(delivery.customerCode) === inputCode) {
            console.log("[Courier Verify] Success!");
            const updates: any = { isCourierVerified: true };
            if (delivery.isCustomerVerified) {
                updates.status = 'delivered';
            }
            await updateDoc(doc(db, 'deliveries', id), updates);
            return true;
        }
        console.log("[Courier Verify] Failed - Mismatch or Not Found");
        return false;
    };

    const requestPhotoDelivery = async (id: string) => {
        await updateDoc(doc(db, 'deliveries', id), { photoDeliveryRequested: true });
    };

    const approvePhotoDelivery = async (id: string) => {
        await updateDoc(doc(db, 'deliveries', id), { photoDeliveryApproved: true });
    };

    const cancelPhotoDelivery = async (id: string) => {
        await updateDoc(doc(db, 'deliveries', id), { photoDeliveryApproved: false });
    };

    const verifyDeliveryByPhoto = async (id: string): Promise<void> => {
        // Photo verification bypasses the code handshake and marks as delivered
        await updateDoc(doc(db, 'deliveries', id), {
            isCourierVerified: true,
            isCustomerVerified: true,
            status: 'delivered'
        });
    };

    return (
        <DeliveryContext.Provider value={{
            deliveries,
            verifyDeliveryByCustomer,
            verifyDeliveryByCourier,
            requestPhotoDelivery,
            approvePhotoDelivery,
            cancelPhotoDelivery,
            verifyDeliveryByPhoto,
            seedDatabase
        }}>
            {children}
        </DeliveryContext.Provider>
    );
}

export function useDelivery() {
    const context = useContext(DeliveryContext);
    if (context === undefined) {
        throw new Error('useDelivery must be used within a DeliveryProvider');
    }
    return context;
}
