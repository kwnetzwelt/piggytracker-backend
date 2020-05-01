export interface PagingResult<T> {
    data: T[];
    total: number;
    page: number;
}
