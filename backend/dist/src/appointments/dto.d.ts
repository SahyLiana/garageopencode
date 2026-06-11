export declare class CreateAppointmentDto {
    clientId?: number;
    mechanicId?: number;
    vehicleId: number;
    dateTime: string;
    category: string;
    description: string;
    imageUrl?: string;
}
export declare class UpdateAppointmentDto {
    mechanicId?: number;
    vehicleId?: number;
    dateTime?: string;
    category?: string;
    description?: string;
    imageUrl?: string;
}
export declare class UpdateAppointmentStatusDto {
    status: string;
}
