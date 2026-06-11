import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./dto";
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        createdAt: Date;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        createdAt: Date;
    }>;
    create(dto: CreateUserDto): Promise<{
        id: number;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
