export declare class PaginationDto {
    page: number;
    limit: number;
    constructor(page?: number, limit?: number);
    getSkip(): number;
}
