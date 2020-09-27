import { UpdateDateColumn, CreateDateColumn } from 'typeorm'

export class BaseEntity {
    @CreateDateColumn({
        default: null,
        type: 'datetime',
    })
    createdDate: Date
    
    @UpdateDateColumn({
        default: null,
        type: 'datetime',
    })
    updatedDate: Date
}