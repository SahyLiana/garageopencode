export declare class CreateVehicleDto {
    clientId: number;
    make: string;
    model: string;
    year: number;
    licensePlate: string;
    vin?: string;
}
export declare class UpdateVehicleDto {
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    vin?: string;
}
