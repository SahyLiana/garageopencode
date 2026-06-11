export class PaginationDto {
  page: number;
  limit: number;
  
  constructor(page: number = 1, limit: number = 10) {
    this.page = page;
    this.limit = limit;
  }
  
  getSkip(): number {
    return (this.page - 1) * this.limit;
  }
}