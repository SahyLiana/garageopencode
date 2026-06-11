"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommentsService = class CommentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findByAppointment(appointmentId) {
        return this.prisma.comment.findMany({
            where: { appointmentId },
            include: { author: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }
    async create(dto, authorId) {
        if (dto.appointmentId) {
            const appt = await this.prisma.appointment.findUnique({ where: { id: dto.appointmentId } });
            if (appt && ['CANCELLED', 'CANCEL_REQUESTED'].includes(appt.status)) {
                throw new common_1.ForbiddenException('Cannot send messages on a cancelled appointment');
            }
        }
        return this.prisma.comment.create({
            data: {
                content: dto.content,
                authorId,
                appointmentId: dto.appointmentId || null,
            },
            include: { author: { select: { id: true, name: true, role: true } } },
        });
    }
    async remove(id, user) {
        const comment = await this.prisma.comment.findUnique({ where: { id } });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        if (comment.authorId !== user.id && user.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Not authorized');
        }
        await this.prisma.comment.delete({ where: { id } });
        return { message: 'Comment deleted' };
    }
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map