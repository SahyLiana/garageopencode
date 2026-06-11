import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto';
export declare class CommentsController {
    private commentsService;
    constructor(commentsService: CommentsService);
    findAll(appointmentId?: string): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]> | never[];
    create(dto: CreateCommentDto, user: any): Promise<{
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
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
}
