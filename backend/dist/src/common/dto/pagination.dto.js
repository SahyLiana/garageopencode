"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationDto = void 0;
class PaginationDto {
    constructor(page = 1, limit = 10) {
        this.page = page;
        this.limit = limit;
    }
    getSkip() {
        return (this.page - 1) * this.limit;
    }
}
exports.PaginationDto = PaginationDto;
//# sourceMappingURL=pagination.dto.js.map