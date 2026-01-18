export interface Delivery {
    id: string;
    customerName: string;
    address: string;
    status: 'pending' | 'delivered';
    coordinate: { lat: number, lng: number }; // Mock coordinates
}

export const MOCK_DELIVERIES: Delivery[] = [
    {
        id: 'TR-129384',
        customerName: 'Ahmet Yılmaz',
        address: 'Cumhuriyet Mah. Atatürk Cad. No:12 D:4, İstanbul',
        status: 'pending',
        coordinate: { lat: 41.0082, lng: 28.9784 }
    },
    {
        id: 'TR-847392',
        customerName: 'Ayşe Demir',
        address: 'Kadıköy Rıhtım Cad. No:5, İstanbul',
        status: 'pending',
        coordinate: { lat: 40.9901, lng: 29.0292 }
    },
    {
        id: 'TR-992817',
        customerName: 'Mehmet Öz',
        address: 'Levent Mah. Büyükdere Cad. No:100, İstanbul',
        status: 'delivered',
        coordinate: { lat: 41.0772, lng: 29.0125 }
    }
];
