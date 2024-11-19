export interface Price {
    id: number
    Trading_Volume: number
    Trading_money: string
    Trading_turnover: number
    close: number
    date: string // ISO 8601 format date
    max: number
    min: number
    open: number
    spread: number
    stock_id: number
}