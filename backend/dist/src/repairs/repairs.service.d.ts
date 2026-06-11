import { PrismaService } from '../prisma/prisma.service';
import { CreateRepairDto, UpdateRepairDto } from './dto';
export declare class RepairsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findByMechanic(mechanicId: number): any;
    findByClient(userId: number): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreateRepairDto): Promise<any>;
    update(id: number, dto: UpdateRepairDto): Promise<any>;
    updateStatus(id: number, status: string, user: any): Promise<any>;
    getHistory(id: number): any;
    remove(id: number, user: any): Promise<void>;
}
