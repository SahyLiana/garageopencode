import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
export declare class VehiclesController {
    private vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findAll(user: any, clientId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        vin: string | null;
    }[]>;
    findOne(id: string): Promise<{
        client: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        vin: string | null;
    }>;
    create(dto: CreateVehicleDto, user: any): import(".prisma/client").Prisma.Prisma__VehicleClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        vin: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, dto: UpdateVehicleDto): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        clientId: number;
        make: string;
        model: string;
        year: number;
        licensePlate: string;
        vin: string | null;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
