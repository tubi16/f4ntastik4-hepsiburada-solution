import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MOCK_DELIVERIES, Delivery } from '../data/mock';

// Extended Delivery type with verification codes
export interface ExtendedDelivery extends Delivery {
    courierCode: string; // Code the courier gives to the customer (Customer enters this)
    customerCode: string; // Code the customer gives to the courier (Courier enters this)
    photoDeliveryRequested?: boolean; // Courier requested photo delivery
    photoDeliveryApproved?: boolean; // Customer approved photo delivery
}

interface DeliveryContextType {
    deliveries: ExtendedDelivery[];
    verifyDeliveryByCustomer: (id: string, inputCode: string) => boolean;
    verifyDeliveryByCourier: (id: string, inputCode: string) => boolean;
    requestPhotoDelivery: (id: string) => void;
    approvePhotoDelivery: (id: string) => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: ReactNode }) {
    // Initialize with mock data and random codes
    const [deliveries, setDeliveries] = useState<ExtendedDelivery[]>(() =>
        MOCK_DELIVERIES.map(d => ({
            ...d,
            courierCode: Math.floor(100000 + Math.random() * 900000).toString(), // Random 6 digits
            customerCode: Math.floor(100000 + Math.random() * 900000).toString(), // Random 6 digits
            photoDeliveryRequested: false,
            photoDeliveryApproved: false,
        }))
    );

    const verifyDeliveryByCustomer = (id: string, inputCode: string): boolean => {
        const delivery = deliveries.find(d => d.id === id);
        if (delivery && delivery.courierCode === inputCode) {
            setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'delivered' } : d));
            return true;
        }
        return false;
    };

    const verifyDeliveryByCourier = (id: string, inputCode: string): boolean => {
        const delivery = deliveries.find(d => d.id === id);
        if (delivery && delivery.customerCode === inputCode) {
            setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'delivered' } : d));
            return true;
        }
        return false;
    };

    const requestPhotoDelivery = (id: string) => {
        setDeliveries(prev => prev.map(d => d.id === id ? { ...d, photoDeliveryRequested: true } : d));
    };

    const approvePhotoDelivery = (id: string) => {
        setDeliveries(prev => prev.map(d => d.id === id ? {
            ...d,
            photoDeliveryApproved: true
        } : d));
    };

    return (
        <DeliveryContext.Provider value={{
            deliveries,
            verifyDeliveryByCustomer,
            verifyDeliveryByCourier,
            requestPhotoDelivery,
            approvePhotoDelivery
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
