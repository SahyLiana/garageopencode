export declare class CreateInventoryItemDto {
    name: string;
    price: number;
    quantity: number;
    category?: string;
    description?: string;
}
export declare class UpdateInventoryItemDto {
    name?: string;
    price?: number;
    quantity?: number;
    category?: string;
    description?: string;
}
export declare class AssignItemDto {
    itemId: number;
    quantity: number;
}
