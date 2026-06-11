import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto, UpdateAppointmentStatusDto } from './dto';
export declare class AppointmentsController {
    private appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    findAll(user: any): import(".prisma/client").Prisma.PrismaPromise<({
        client: {
            id: number;
            email: string;
            name: string;
        };
        vehicle: {
            id: number;
            clientId: number;
            createdAt: Date;
            updatedAt: Date;
            make: string;
            model: string;
            year: number;
            licensePlate: string;
            vin: string | null;
        };
        usedParts: ({
            item: {
                id: number;
                category: string | null;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                quantity: number;
                price: number;
            };
        } & {
            id: number;
            status: string;
            appointmentId: number;
            itemId: number;
            quantity: number;
            assignedAt: Date;
        })[];
    } & {
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    })[]> | import(".prisma/client").Prisma.PrismaPromise<({
        mechanic: {
            id: number;
            email: string;
            name: string;
        } | null;
        vehicle: {
            id: number;
            clientId: number;
            createdAt: Date;
            updatedAt: Date;
            make: string;
            model: string;
            year: number;
            licensePlate: string;
            vin: string | null;
        };
        usedParts: ({
            item: {
                id: number;
                category: string | null;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                quantity: number;
                price: number;
            };
        } & {
            id: number;
            status: string;
            appointmentId: number;
            itemId: number;
            quantity: number;
            assignedAt: Date;
        })[];
    } & {
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        client: {
            id: number;
            email: string;
            name: string;
        };
        mechanic: {
            id: number;
            email: string;
            name: string;
        } | null;
        vehicle: {
            id: number;
            clientId: number;
            createdAt: Date;
            updatedAt: Date;
            make: string;
            model: string;
            year: number;
            licensePlate: string;
            vin: string | null;
        };
        comments: ({
            author: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            appointmentId: number | null;
            content: string;
            authorId: number;
        })[];
        usedParts: ({
            item: {
                id: number;
                category: string | null;
                description: string | null;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                quantity: number;
                price: number;
            };
        } & {
            id: number;
            status: string;
            appointmentId: number;
            itemId: number;
            quantity: number;
            assignedAt: Date;
        })[];
    } & {
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateAppointmentDto, user: any, file?: Express.Multer.File): Promise<{
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateImage(id: string, file: Express.Multer.File): Promise<{
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateAppointmentDto): Promise<{
        client: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            name: string;
            phone: string | null;
            role: string;
        };
        mechanic: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            name: string;
            phone: string | null;
            role: string;
        } | null;
        vehicle: {
            id: number;
            clientId: number;
            createdAt: Date;
            updatedAt: Date;
            make: string;
            model: string;
            year: number;
            licensePlate: string;
            vin: string | null;
        };
    } & {
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, dto: UpdateAppointmentStatusDto, user: any): Promise<{
        client: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            name: string;
            phone: string | null;
            role: string;
        };
        mechanic: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            name: string;
            phone: string | null;
            role: string;
        } | null;
        vehicle: {
            id: number;
            clientId: number;
            createdAt: Date;
            updatedAt: Date;
            make: string;
            model: string;
            year: number;
            licensePlate: string;
            vin: string | null;
        };
    } & {
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number, user: any): Promise<void>;
    pay(id: string, user: any): Promise<{
        id: number;
        clientId: number;
        mechanicId: number | null;
        vehicleId: number;
        dateTime: Date;
        category: string;
        description: string;
        imageUrl: string | null;
        status: string;
        totalAmount: number | null;
        paidAt: Date | null;
        paymentStatus: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
