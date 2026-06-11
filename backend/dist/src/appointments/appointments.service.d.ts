import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { UsersService } from "../users/users.service";
import { CreateAppointmentDto, UpdateAppointmentDto } from "./dto";
export declare class AppointmentsService {
    private prisma;
    private notificationsService;
    private usersService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService, usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
    findByMechanic(mechanicId: number): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findByClient(clientId: number): import(".prisma/client").Prisma.PrismaPromise<({
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
    findOne(id: number): Promise<{
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
    create(dto: CreateAppointmentDto, user: any): Promise<{
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
    update(id: number, dto: UpdateAppointmentDto): Promise<{
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
    updateStatus(id: number, status: string, user: any): Promise<{
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
    confirmPayment(id: number, user: any): Promise<{
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
    updateImage(id: number, imageUrl: string): Promise<{
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
}
