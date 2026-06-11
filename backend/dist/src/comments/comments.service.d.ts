import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto';
export declare class CommentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByAppointment(appointmentId: number): import(".prisma/client").Prisma.PrismaPromise<({
        author: {
            id: number;
            name: string;
            role: string;
        };
    } & {
        id: number;
        createdAt: Date;
        authorId: number;
        appointmentId: number | null;
        content: string;
    })[]>;
    create(dto: CreateCommentDto, authorId: number): Promise<{
        author: {
            id: number;
            name: string;
            role: string;
        };
    } & {
        id: number;
        createdAt: Date;
        authorId: number;
        appointmentId: number | null;
        content: string;
    }>;
    remove(id: number, user: any): Promise<{
        message: string;
    }>;
}
