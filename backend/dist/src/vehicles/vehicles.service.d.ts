import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto';
export declare class VehiclesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findByClient(clientId: number): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(id: number): Promise<{
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
    create(dto: CreateVehicleDto): import(".prisma/client").Prisma.Prisma__VehicleClient<{
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
    update(id: number, dto: UpdateVehicleDto): Promise<{
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
    remove(id: number): Promise<{
        message: string;
    }>;
}
