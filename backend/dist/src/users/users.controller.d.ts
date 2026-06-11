import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
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
    update(id: string, dto: UpdateUserDto): Promise<{
        id: number;
        email: string;
        name: string;
        phone: string | null;
        role: string;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
