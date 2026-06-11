import { RepairsService } from './repairs.service';
import { CreateRepairDto, UpdateRepairDto, UpdateRepairStatusDto } from './dto';
export declare class RepairsController {
    private repairsService;
    constructor(repairsService: RepairsService);
    findAll(user: any): any;
    findOne(id: string): Promise<any>;
    getHistory(id: string): any;
    create(dto: CreateRepairDto): Promise<any>;
    update(id: string, dto: UpdateRepairDto): Promise<any>;
    updateStatus(id: string, dto: UpdateRepairStatusDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<void>;
}
