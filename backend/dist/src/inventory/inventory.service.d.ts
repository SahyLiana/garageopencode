import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, AssignItemDto } from './dto';
export declare class InventoryService {
    private prisma;
    private notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        price: number;
        quantity: number;
        category: string | null;
        description: string | null;
    }[]>;
    findOne(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        price: number;
        quantity: number;
        category: string | null;
        description: string | null;
    }>;
    create(dto: CreateInventoryItemDto): import(".prisma/client").Prisma.Prisma__InventoryItemClient<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        price: number;
        quantity: number;
        category: string | null;
        description: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, dto: UpdateInventoryItemDto): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        price: number;
        quantity: number;
        category: string | null;
        description: string | null;
    }>;
    remove(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        name: string;
        price: number;
        quantity: number;
        category: string | null;
        description: string | null;
    }>;
    assignToAppointment(appointmentId: number, dto: AssignItemDto): Promise<{
        item: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            price: number;
            quantity: number;
            category: string | null;
            description: string | null;
        };
    } & {
        id: number;
        quantity: number;
        status: string;
        assignedAt: Date;
        appointmentId: number;
        itemId: number;
    }>;
    requestItem(appointmentId: number, dto: AssignItemDto): Promise<{
        item: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            price: number;
            quantity: number;
            category: string | null;
            description: string | null;
        };
    } & {
        id: number;
        quantity: number;
        status: string;
        assignedAt: Date;
        appointmentId: number;
        itemId: number;
    }>;
    approveRequest(usedPartId: number): Promise<{
        item: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            price: number;
            quantity: number;
            category: string | null;
            description: string | null;
        };
    } & {
        id: number;
        quantity: number;
        status: string;
        assignedAt: Date;
        appointmentId: number;
        itemId: number;
    }>;
    rejectRequest(usedPartId: number): Promise<{
        item: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            price: number;
            quantity: number;
            category: string | null;
            description: string | null;
        };
    } & {
        id: number;
        quantity: number;
        status: string;
        assignedAt: Date;
        appointmentId: number;
        itemId: number;
    }>;
    getAssignmentsForAppointment(appointmentId: number): Promise<({
        item: {
            createdAt: Date;
            updatedAt: Date;
            id: number;
            name: string;
            price: number;
            quantity: number;
            category: string | null;
            description: string | null;
        };
    } & {
        id: number;
        quantity: number;
        status: string;
        assignedAt: Date;
        appointmentId: number;
        itemId: number;
    })[]>;
}
