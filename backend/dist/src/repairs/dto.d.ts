export declare class CreateRepairDto {
    vehicleId: number;
    mechanicId: number;
    description: string;
    cost?: number;
}
export declare class UpdateRepairDto {
    description?: string;
    cost?: number;
    mechanicId?: number;
}
export declare class UpdateRepairStatusDto {
    status: string;
}
